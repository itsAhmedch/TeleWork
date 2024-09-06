import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/User.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from 'src/entities/team.entity';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';
import { hasRoles } from 'src/guards/decorator/roles.decorator';




@Controller('user/')
@UseGuards(JwtAuthGuard, RolesGuard)

export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  @Post()
  @hasRoles('respo','admin')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (user) {
      throw new NotFoundException(`email already exists`);
    }

    if (createUserDto.role === 'collab') {
      if (createUserDto.idTeam) {
        const Team = await this.teamRepository.findOneBy({
          id: createUserDto.idTeam,
        });
        if (!Team) {
          throw new NotFoundException(`This team is not exist`);
        }
      } else throw new NotFoundException(`idTeam should not be empty`);
    }

    return await this.userService.create(createUserDto);
  }

  @Get()
  @hasRoles('respo','admin')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @hasRoles('respo','admin')
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  @hasRoles('respo','admin')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @hasRoles('respo','admin')
  async remove(@Param('id') id: number) {
    return await this.userService.remove(id);
  }
}
