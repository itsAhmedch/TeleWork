import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Plan } from 'src/entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto } from 'src/dto/Plan.dto';
import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async getPlans(idTeams: number[], isProposal: boolean): Promise<any> {
    // Fetch all users belonging to the specified teams
    const users = await this.userRepository.find({
      where: { team: { id: In(idTeams) } }, // Fetch users belonging to any of the specified team IDs
      select: ['id'], // Fetch only user IDs
    });

    const userIds = users.map(user => user.id); // Extract user IDs

    // Fetch plans associated with those user IDs
    const plans = await this.planRepository.find({
      where: {
        collab: { id: In(userIds) }, // Assuming 'collab' is the relationship to users in the Plan entity
        isProposal: isProposal, // Additional filter based on the isProposal flag
      },
    });

    return plans;
  }
  async processPlanChanges(
    planChanges: { Id: number; dates: string; action: string }[],
    isProposal: boolean,
  ): Promise<void> {
    for (const change of planChanges) {
      const { Id, dates, action } = change;
      let idTeam: number;
      const user = await this.userRepository.findOne({
        where: { id: Id },
        relations: ['team'], // Make sure to include 'team' in relations
      });

      if (user && user.team) {
        idTeam = user.team.id;
     
      } else {
        throw new NotFoundException('User or Team not found');
      }

      // Convert the date string to a Date object
      const dateObj = new Date(dates);

      if (action === 'delete') {
        // Delete plan logic
        await this.planRepository.delete({
          collab: { id: Id }, // Collab object reference
          team: { id: idTeam },
          date: dateObj,
          isProposal: isProposal, // Pass the Date object instead of a string
        });
      } else if (action === 'add') {
        // Check if the plan exists before adding
        const existingPlan = await this.planRepository.findOne({
          where: { collab: { id: Id }, team: { id: idTeam }, date: dateObj },
        });

        // If the plan doesn't exist, create and save a new one
        if (!existingPlan) {
          const newPlan = this.planRepository.create({
            collab: { id: Id },
            date: dateObj, // Pass the Date object instead of a string
            team: { id: idTeam },
            isProposal: isProposal, // Assuming `proposal` is a boolean field
          });
          await this.planRepository.save(newPlan);
        }
      } else {
        throw new BadRequestException(`Invalid action: ${action}`);
      }
    }
  }
}
