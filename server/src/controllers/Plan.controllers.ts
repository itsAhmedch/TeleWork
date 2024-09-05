import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { PlanService } from 'src/services/Plan.service';
import { CreatePlanDto, UpdatePlanDto } from 'src/dto/Plan.dto';
import { Plan } from 'src/entities/plan.entity';
import { Team } from 'src/entities/team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
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

    return this.planService.create(createPlanDto,team,collab);
  }

  @Get()
  findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Plan> {
    return this.planService.findOne(id);
  }

  @Get('/ByCollab/:id')
  findByCollab(@Param('id') id: number): Promise<Plan[]> {
    return this.planService.findByCollab(id);
  }

  @Get('/ByTeam/:id')
  findByTeam(@Param('id') id: number): Promise<Plan[]> {
    return this.planService.findByTeam(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.planService.remove(id);
  }
}
