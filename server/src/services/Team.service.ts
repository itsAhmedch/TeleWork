import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from './../entities/Team.entity';
import { CreateTeamDto, UpdateTeamDto } from './../dto/Team.dto';
import { User } from './../entities/user.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(
    responsable: User,
    leader: User | null,
    parentTeam: Team | null,
    teamData: Partial<Team>,
  ): Promise<Partial<Team>> {
    // Changed return type to Partial<Team> to be more flexible
    try {
      // Create the new team
      const team = this.teamRepository.create({
        ...teamData,
        responsable, // The responsable field is set here
        leader,
        parentTeam, // Set parent team if exists, null otherwise
      });

      // Await the team saving process
      const savedTeam = await this.teamRepository.save(team);

      // Return only the fields you want, excluding 'responsable'
      return {
        id: savedTeam.id, // Include the id and other necessary fields
        name: savedTeam.name, // Example field
        leader: savedTeam.leader,
        parentTeam: savedTeam.parentTeam,
        // Include other fields that are necessary, except 'responsable'
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Fetch all teams with relations
  async findAll(): Promise<Team[]> {
    try {
      return this.teamRepository.find({
        relations: ['responsable', 'leader', 'childTeams', 'parentTeam'], // Add childTeams relation
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Find a specific team by ID
  async findOne(id: number): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({
        where: { id },
        relations: ['responsable', 'leader', 'parentTeam'], // Add necessary relations
      });
      if (!team) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }
      return team;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Find teams by responsable user ID
  async findTeamByRespo(responsableId: number): Promise<Team[]> {
    try {
      const teams = await this.teamRepository.find({
        where: {
          responsable: { id: responsableId },
          parentTeam: null,
        },
        relations: ['parentTeam'],
      });

      if (!teams.length) {
        throw new NotFoundException(
          `No teams found for responsable with ID ${responsableId}`,
        );
      }

      return teams.filter((team) => team.parentTeam === null);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findSubTeamByRespo(
    responsableId: number,
    teamId: number,
  ): Promise<Team[]> {
    try {
      const teams = await this.teamRepository.find({
        where: {
          responsable: { id: responsableId },
          parentTeam: { id: teamId },
        },
        relations: ['parentTeam'],
      });
      if (!teams.length) {
        throw new NotFoundException(
          `No teams found for responsable with ID ${responsableId}`,
        );
      }

      return teams;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Update a team by ID
  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({
        where: { id },
        relations: ['responsable', 'leader', 'parentTeam'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }

      // Handle updating leader
      if (updateTeamDto.idLeader) {
        const leader = await this.userRepository.findOneBy({
          id: updateTeamDto.idLeader,
          team: { id: id },
        });
        if (!leader) {
          throw new NotFoundException(
            `User with ID ${updateTeamDto.idLeader} not found in this team`,
          );
        }
        team.leader = leader;
      }

      // Update and save the team
      const updatedTeam = this.teamRepository.merge(team, updateTeamDto);
      return this.teamRepository.save(updatedTeam);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Fetch the team and its child teams using relations
      const team = await this.teamRepository.findOne({
        where: { id },
        relations: ['childTeams'], // Load child teams
      });

      // Throw exception if the team doesn't exist
      if (!team) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }

      // Check if the main team has users
      const mainTeamUser = await this.userRepository.findOne({
        where: { team: { id } },
        relations: ['team'],
      });

      if (mainTeamUser) {
        throw new ConflictException(
          `You must delete all users in the main team (ID: ${team.name}) before deleting it`,
        );
      }

      // Check if any child team has users
      for (const childTeam of team.childTeams) {
        const userInChildTeam = await this.userRepository.findOne({
          where: { team: { id: childTeam.id } },
          relations: ['team'],
        });

        if (userInChildTeam) {
          throw new ConflictException(
            `You must delete all users in child team  '${childTeam.name}' before deleting it`,
          );
        }
      }

      // If no users in main or child teams, remove child teams first
      if (team.childTeams && team.childTeams.length > 0) {
        await this.teamRepository.remove(team.childTeams);
      }

      // Now remove the parent team
      await this.teamRepository.remove(team);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // Helper function to recursively fetch child team IDs
  async getAllTeamIdsWithChildren(idTeams: number[]): Promise<number[]> {
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
}
