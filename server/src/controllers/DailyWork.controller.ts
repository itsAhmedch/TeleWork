import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DailyWorkService } from 'src/services/DailyWork.service';
import { CreateDailyWorkDto } from 'src/dto/DailyWork.dto';
import { DailyWork } from 'src/entities/DailyWork.entity';

@Controller('Daily-Work')
export class DailyWorkController {
  constructor(private readonly DailyWorkService: DailyWorkService) {}

  @Post()
  async create(@Body() CreateDailyWorkDto: CreateDailyWorkDto): Promise<DailyWork> {
    return this.DailyWorkService.create(CreateDailyWorkDto);
  }

  @Get()
  async findAll(): Promise<DailyWork[]> {
    return this.DailyWorkService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<DailyWork> {
    return this.DailyWorkService.findOne(id);
  }

  @Get('/by-Collab/:id')
  async findByCollab(@Param('id') id: number): Promise<DailyWork[]> {
    return this.DailyWorkService.findByCollab(id);
  }


}
