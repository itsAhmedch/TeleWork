import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/entities/plan.entity';
import { PlanService } from 'src/services/Plan.service';
import { PlanController } from 'src/controllers/Plan.controllers';
import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';
import { authService } from 'src/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ExtractDataService } from 'src/services/ExtractData.service';
import { TeamService } from 'src/services/Team.service';
import { DailyWork } from 'src/entities/DailyWork.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan,Team,User,DailyWork])],
  providers: [PlanService,authService,JwtService,ExtractDataService,TeamService],
  controllers: [PlanController],
})
export class PlanModule {}
