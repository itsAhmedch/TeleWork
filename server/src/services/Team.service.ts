import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // Create a new team with optional parent team
  async create(
    responsable: User,
    leader: User | null,
    parentTeam: Team | null,
    teamData: Partial<Team>
  ): Promise<Team> {
    try {
      // Create the new team
      
      
      const team = this.teamRepository.create({
        ...teamData,
        responsable,
        leader,
        parentTeam, // Set parent team if exists, null otherwise
      });

      console.log(team.parentTeam);
      
  
      return this.teamRepository.save(team);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }
  

  

  // Fetch all teams with relations
  async findAll(): Promise<Team[]> {
    try {
      return this.teamRepository.find({
        relations: ['responsable', 'leader', 'childTeams','parentTeam'], // Add childTeams relation
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  // Find a specific team by ID
  async findOne(id: number): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({
        where: { id },
        relations: ['responsable', 'leader', 'childTeams', 'parentTeam'], // Add necessary relations
      });
      if (!team) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }
      return team;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  // Find teams by responsable user ID
  async findByRespo(responsableId: number): Promise<Team[]> {
    try {
      const teams = await this.teamRepository.findBy({
        responsable: { id: responsableId },
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
          idTeam:id
        });
        if (!leader) {
          throw new NotFoundException(`User with ID ${updateTeamDto.idLeader} not found in this team`);
        }
        team.leader = leader;
      }

     

      // Update and save the team
      const updatedTeam = this.teamRepository.merge(team, updateTeamDto);
      return this.teamRepository.save(updatedTeam);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  // Remove a team and cascade delete child teams
  async remove(id: number): Promise<void> {
    try {
      const team = await this.teamRepository.findOne({
        where: { id },
        relations: ['childTeams'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }

      // Remove the team, and child teams will be deleted due to CASCADE
      await this.teamRepository.remove(team);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }
}
