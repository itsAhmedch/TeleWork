import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto } from 'src/dto/Plan.dto';
import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    // Check if the team exists
    const team = await this.teamRepository.findOne({ where: { id: createPlanDto.idTeam } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${createPlanDto.idTeam} not found`);
    }

    // Check if the collaborator (collab) exists
    const collab = await this.userRepository.findOne({ where: { id: createPlanDto.idCollab } });
    if (!collab) {
      throw new NotFoundException(`Collaborator with ID ${createPlanDto.idCollab} not found`);
    }

    // Check if the team already has two plans
    const existingPlans = await this.planRepository.find({
      where: { team: { id: createPlanDto.idTeam } },
    });

    if (existingPlans.length >= 2) {
      throw new BadRequestException(`Team with ID ${createPlanDto.idTeam} already has 2 plans.`);
    }

    // Create and save the new plan
    const plan = this.planRepository.create({
      ...createPlanDto,
      date: new Date(createPlanDto.date), // Convert string to Date
      team,
      collab,
    });
    
    return this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({ relations: ['team', 'collab'] });
  }

  async findByCollab(idCollab: number): Promise<Plan[]> {
    const plans = await this.planRepository.find({ where: { collab: { id: idCollab } }, relations: ['team', 'collab'] });
    if (!plans || plans.length === 0) {
      throw new NotFoundException(`No plans found for collaborator with ID ${idCollab}`);
    }
    return plans;
  }

  async findByTeam(idTeam: number): Promise<Plan[]> {
    const plans = await this.planRepository.find({
      where: { team: { id: idTeam } },
      relations: ['team', 'collab'],
    });
    if (!plans || plans.length === 0) {
      throw new NotFoundException(`No plans found for team with ID ${idTeam}`);
    }
    return plans;
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id }, relations: ['team', 'collab'] });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async remove(id: number): Promise<void> {
    const result = await this.planRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }
}
