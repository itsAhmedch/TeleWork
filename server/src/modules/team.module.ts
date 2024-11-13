import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from 'src/controllers/team.controller';

import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';
import { authService } from 'src/services/auth.service';
import { TeamService } from 'src/services/Team.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Team,User]), // Register User entity for dependency injection
  ],
  controllers: [TeamController],
  providers: [TeamService,JwtService,authService

   
  ],
})
export class TeamModule {}
