import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from 'src/controllers/team.controller';

import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';
import { TeamService } from 'src/services/Team.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Team,User]), // Register User entity for dependency injection
  ],
  controllers: [TeamController],
  providers: [TeamService,

   
  ],
})
export class TeamModule {}
