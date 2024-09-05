import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DailyWorkService } from 'src/services/DailyWork.service';
import { CreateDailyWorkDto } from 'src/dto/DailyWork.dto';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('Daily-Work')
export class DailyWorkController {
  constructor(private readonly DailyWorkService: DailyWorkService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(
    @Body() CreateDailyWorkDto: CreateDailyWorkDto,
  ): Promise<DailyWork> {
    
    // Fetch the user by ID
    const user = await this.userRepository.findOne({ where: { id: CreateDailyWorkDto.idCollab } });

    // Handle the error and throw HttpException
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }


    return this.DailyWorkService.create(CreateDailyWorkDto,user);
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
