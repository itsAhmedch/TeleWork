import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/entities/plan.entity';
import { PlanService } from 'src/services/Plan.service';
import { PlanController } from 'src/controllers/Plan.controllers';
import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';
import { authService } from 'src/services/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Plan,Team,User])],
  providers: [PlanService,authService,JwtService],
  controllers: [PlanController],
})
export class PlanModule {}
