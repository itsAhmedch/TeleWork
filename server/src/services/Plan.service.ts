import {
  BadRequestException,
  ConflictException,
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
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createPlanDto: CreatePlanDto, team, collab) {
    // try {
    //   // Create and save the new plan
    //   const plan = this.planRepository.create({
    //     ...createPlanDto,
    //     date: new Date(createPlanDto.date), // Convert string to Date
    //     team,
    //     collab,
    //   });
    //   return this.planRepository.save(plan);
    // } catch (error) {
    //   console.log(error);
    //   throw new BadRequestException(error);
    // }
  }

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
    // Step 1: Fetch all the child teams (subteams) related to the specified team IDs
    const allTeamIds = await this.getAllTeamIdsWithChildren(idTeams);

    console.log(idTeams, ' ', isProposal);

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

    console.log('Fetched Plans:', plans);

    return plans;
  }

  // Helper function to recursively fetch child team IDs
  private async getAllTeamIdsWithChildren(
    idTeams: number[],
  ): Promise<number[]> {
    // Step 1: Fetch all the teams and their children
    const teamsWithChildren = await this.teamRepository.find({
      where: { parentTeam: { id: In(idTeams) } }, // Assuming parentTeam is the relation to the parent team
      select: ['id'], // Only need team IDs
    });

    const childTeamIds = teamsWithChildren.map((team) => team.id); // Extract child team IDs

    // Step 2: If there are no more child teams, return the original IDs
    if (childTeamIds.length === 0) {
      return idTeams;
    }

    // Step 3: Recursively fetch subteams of the current child teams
    const nestedChildTeamIds =
      await this.getAllTeamIdsWithChildren(childTeamIds);

    // Step 4: Return all IDs (original team IDs + child team IDs)
    return [...idTeams, ...nestedChildTeamIds];
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

      console.log(planChanges);

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

      console.log(targetDate, currentDate, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');

      // Check if the target date is valid and >= today
      if (isNaN(targetDate.getTime()) || targetDate < currentDate) {
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
