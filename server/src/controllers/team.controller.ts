import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeamService } from './../services/Team.service';
import { CreateTeamDto ,UpdateTeamDto} from './../dto/Team.dto';


@Controller('team/')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.create(createTeamDto);
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
