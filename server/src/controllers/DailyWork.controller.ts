import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { DailyWorkService } from 'src/services/DailyWork.service';
import { CreateDailyWorkDto } from 'src/dto/DailyWork.dto';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';
import { hasRoles } from 'src/guards/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('Daily-Work')
export class DailyWorkController {
  constructor(private readonly DailyWorkService: DailyWorkService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  @hasRoles('collab','leader')
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
  @hasRoles('respo','admin')
  async findAll(): Promise<DailyWork[]> {
    return this.DailyWorkService.findAll();
  }

  @Get(':id')
  @hasRoles('respo','admin')
  async findOne(@Param('id') id: number): Promise<DailyWork> {
    return this.DailyWorkService.findOne(id);
  }

  @Get('/by-Collab/:id')
  @hasRoles('respo','admin')
  async findByCollab(@Param('id') id: number): Promise<DailyWork[]> {
    return this.DailyWorkService.findByCollab(id);
  }
}
