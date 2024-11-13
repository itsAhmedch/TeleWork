import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { DailyWorkService } from 'src/services/DailyWork.service';
import { DailyWorkController } from 'src/controllers/DailyWork.controller';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';
import { Team } from 'src/entities/team.entity';
import { JwtService } from '@nestjs/jwt';
import { authService } from 'src/services/auth.service';
import { PlanService } from 'src/services/Plan.service';
import { Plan } from 'src/entities/plan.entity';
import { TeamService } from 'src/services/Team.service';
import { ExtractDataService } from 'src/services/ExtractData.service';

@Module({
  imports: [TypeOrmModule.forFeature([DailyWork,User,Team,Plan])],
  providers: [DailyWorkService,UserService,JwtService,authService,PlanService,TeamService,ExtractDataService],
  controllers: [DailyWorkController],
  
})
export class DailyWorkModule {}
