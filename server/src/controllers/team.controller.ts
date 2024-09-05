import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { TeamService } from './../services/Team.service';
import { CreateTeamDto, UpdateTeamDto } from './../dto/Team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Team } from 'src/entities/team.entity';

@Controller('team/')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto) {
    const { idRespo, idLeader, idTeam, ...teamData } = createTeamDto;

    // Fetch the responsable user
    const responsable = await this.userRepository.findOneBy({ id: idRespo ,role:'respo'});
    if (!responsable) {
      throw new NotFoundException(`respo with ID ${idRespo} not found`);
    }

    // Fetch the leader user if provided
    let leader: User | null;
    if (idLeader) {
      leader = await this.userRepository.findOneBy({ id: idLeader  , role:'collab'});
      if (!leader) {
        throw new NotFoundException(`User with ID ${idLeader} not found`);
      }

      const leaderIsDuplicated = await this.teamRepository.findOneBy({
        leader: { id: idLeader },
      });
      if (leaderIsDuplicated) {
        throw new NotFoundException(`This leader leads another team.`);
      }
    }

    // Find parent team if provided
    let parentTeam: Team | null = null;
    if (idTeam) {
      parentTeam = await this.teamRepository.findOneBy({ id: idTeam });
      if (!parentTeam) {
        throw new NotFoundException(`Parent team with ID ${idTeam} not found`);
      }
    }

    return this.teamService.create(responsable, leader, parentTeam, teamData);
  }

  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teamService.findOne(id);
  }

  @Get('/By-Respo/:idRespo')
  findByRespo(@Param('idRespo') idRespo: number) {
    return this.teamService.findByRespo(idRespo);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamService.update(id, updateTeamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.teamService.remove(id);
  }
}
