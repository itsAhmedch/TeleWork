import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const { idRespo, idLeader, ...teamData } = createTeamDto;

    // Fetch the responsable user
    const responsable = await this.userRepository.findOne({ where: { id: idRespo } });
    if (!responsable) {
      throw new NotFoundException(`User with ID ${idRespo} not found`);
    }

    // Fetch the leader user if provided
    let leader: User | undefined;
    if (idLeader) {
      leader = await this.userRepository.findOne({ where: { id: idLeader } });
      if (!leader) {
        throw new NotFoundException(`User with ID ${idLeader} not found`);
      }
    }

    // Create the team with fetched users
    const team = this.teamRepository.create({
      ...teamData,
      responsable,
      leader,
    });

    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({ relations: ['responsable', 'leader'] });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async findByRespo(responsableId: number): Promise<Team[]> {
    const teams = await this.teamRepository.find({
      where: { responsable: { id: responsableId } },
      relations: ['responsable', 'leader'],
    });
    if (!teams.length) {
      throw new NotFoundException(`No teams found for responsable with ID ${responsableId}`);
    }
    return teams;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id }, relations: ['responsable', 'leader'] });
    
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Handle the case where the responsable ID might be updated
    if (updateTeamDto.idRespo) {
      const responsable = await this.userRepository.findOne({ where: { id: updateTeamDto.idRespo } });
      if (!responsable) {
        throw new NotFoundException(`User with ID ${updateTeamDto.idRespo} not found`);
      }
      team.responsable = responsable;
    }

    // Handle the case where the leader ID might be updated
    if (updateTeamDto.idLeader) {
      const leader = await this.userRepository.findOne({ where: { id: updateTeamDto.idLeader } });
      if (!leader) {
        throw new NotFoundException(`User with ID ${updateTeamDto.idLeader} not found`);
      }
      team.leader = leader;
    }

    // Update the team with new data
    const updatedTeam = this.teamRepository.merge(team, updateTeamDto);
    return this.teamRepository.save(updatedTeam);
  }

  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
