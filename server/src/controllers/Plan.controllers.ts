import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PlanService } from 'src/services/Plan.service';
import { CreatePlanDto ,UpdatePlanDto} from 'src/dto/Plan.dto';
import { Plan } from 'src/entities/plan.entity';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.planService.create(createPlanDto);
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
