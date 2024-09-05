import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  async create(createPlanDto: CreatePlanDto, team, collab): Promise<Plan> {
    try {
      // Create and save the new plan
      const plan = this.planRepository.create({
        ...createPlanDto,
        date: new Date(createPlanDto.date), // Convert string to Date
        team,
        collab,
      });

      return this.planRepository.save(plan);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Plan[]> {
    try {
      return this.planRepository.find({ relations: ['team', 'collab'] });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findByCollab(idCollab: number): Promise<Plan[]> {
    try {
      const plans = await this.planRepository.find({
        where: { collab: { id: idCollab } },
        relations: ['team', 'collab'],
      });
      if (!plans || plans.length === 0) {
        throw new NotFoundException(
          `No plans found for collaborator with ID ${idCollab}`,
        );
      }
      return plans;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findByTeam(idTeam: number): Promise<Plan[]> {
    try {
      const plans = await this.planRepository.find({
        where: { team: { id: idTeam } },
        relations: ['team', 'collab'],
      });
      if (!plans || plans.length === 0) {
        throw new NotFoundException(
          `No plans found for team with ID ${idTeam}`,
        );
      }
      return plans;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOne({
        where: { id },
        relations: ['team', 'collab'],
      });
      if (!plan) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }
      return plan;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.planRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
