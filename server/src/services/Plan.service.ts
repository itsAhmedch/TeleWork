import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { Plan } from 'src/entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto } from 'src/dto/Plan.dto';
import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';
import { TeamService } from './Team.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private teamService: TeamService,
  ) {}

  async findAll(isproposal: boolean): Promise<any[]> {
    try {
      const plans = await this.planRepository.find({
        where: { isProposal: isproposal },
        relations: ['team', 'collab'],
      });

      // After fetching, map to extract only the necessary fields
      const result = plans.map((plan) => ({
        date: plan.date,
        CollabId: plan.collab.id, // Extract the 'collab' id
        isProposal: plan.isProposal,
      }));

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findByCollab(idCollab: number, proposal: boolean): Promise<Plan[]> {
    try {
      let plans;
      if (proposal) {
        const today = this.formatDateToYYYYMMDD(new Date());
        plans = await this.planRepository.find({
          where: {
            collab: { id: idCollab },
            isProposal: true,
            date: MoreThan(today), // Compare string dates
          },
          select: ['date'],
        });
      } else {
        plans = await this.planRepository.find({
          where: { collab: { id: idCollab }, isProposal: false },
          select: ['date'],
        });
      }

      return plans;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findByTeam(
    idTeam: number,
  ): Promise<{ date: string; CollabId: number; isProposal: boolean }[]> {
    try {
      const plans = await this.planRepository.find({
        where: { team: { id: idTeam } },
        relations: ['team', 'collab'],
      });
      // After fetching, map to extract only the necessary fields
      const result = plans.map((plan) => ({
        date: plan.date,
        CollabId: plan.collab.id, // Extract the 'collab' id
        isProposal: plan.isProposal,
      }));

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getPlans(idTeams: number[], isProposal: boolean): Promise<any> {
    // Step 1: Fetch all the child teams (subteams) related to the specified team IDs
    const allTeamIds =
      await this.teamService.getAllTeamIdsWithChildren(idTeams);

    // Step 2: Fetch all users belonging to the specified teams and their subteams
    const users = await this.userRepository.find({
      where: { team: { id: In(allTeamIds) } }, // Fetch users belonging to any of the specified team IDs
      select: ['id'], // Fetch only user IDs
    });

    const userIds = users.map((user) => user.id); // Extract user IDs

    // Step 3: Fetch plans associated with those user IDs
    const plans = await this.planRepository.find({
      where: {
        collab: { id: In(userIds) },
        isProposal: isProposal,
      },
      select: ['date', 'isProposal'], // Select only the 'date' field from the Plan entity
      relations: ['collab'], // Fetch the 'collab' relationship
    });

    // After fetching, map to extract only the necessary fields
    const result = plans.map((plan) => ({
      date: plan.date,
      CollabId: plan.collab.id, // Extract the 'collab' id
      isProposal: plan.isProposal,
    }));

    return result;
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    return `${year}-${month}-${day}`;
  }

  async processPlanChanges(
    planChanges: { CollabId: number; date: string; action: string }[],
    isProposal: boolean,
  ): Promise<void> {
    for (const change of planChanges) {
      const { CollabId, date, action } = change;
      let idTeam: number;

      // Fetch the user and their associated team
      const user = await this.userRepository.findOne({
        where: { id: CollabId },
        relations: ['team'],
      });

      if (!user || !user.team) {
        throw new NotFoundException('User or Team not found');
      }

      idTeam = user.team.id;

      // Convert the date string to a Date object and format it as YYYY-MM-DD
      const dateFormatted = date; // Ensure this is in 'YYYY-MM-DD' format
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00.000)

      const targetDate = new Date(dateFormatted);
      targetDate.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00.000)

      // Check if the target date is valid and >= today
      if (isNaN(targetDate.getTime()) || targetDate <= currentDate) {
        throw new BadRequestException(
          `Date must be today or in the future: ${dateFormatted}`,
        );
      }

      if (action === 'delete') {
        // Handle deletion of plan
        await this.planRepository.delete({
          collab: { id: CollabId },
          team: { id: idTeam },
          date: dateFormatted, // Use the formatted date
          isProposal: isProposal,
        });
      } else if (action === 'add') {
        // Ensure atomicity: Add a new plan only if it doesn't exist already
        const existingPlan = await this.planRepository.findOne({
          where: {
            collab: { id: CollabId },
            team: { id: idTeam },
            date: dateFormatted, // Use the formatted date
            isProposal: isProposal,
          },
        });

        // Only add a new plan if it doesn't already exist
        if (!existingPlan) {
          // Create a new plan using the formatted date
          const newPlan = this.planRepository.create({
            collab: { id: CollabId },
            date: dateFormatted, // Use the formatted date as string
            team: { id: idTeam },
            isProposal: isProposal,
          });

          try {
            // Save the new plan
            await this.planRepository.save(newPlan);
          } catch (error) {
            // Handle duplicate key error
            if (error.code === 'ER_DUP_ENTRY') {
              // MySQL duplicate key error code
              throw new ConflictException('Plan already exists');
            }
            throw error; // Re-throw other errors
          }
        }
      } else {
        throw new BadRequestException(`Invalid action: ${action}`);
      }
    }
  }


}
