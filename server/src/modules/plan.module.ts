import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/entities/plan.entity';
import { PlanService } from 'src/services/Plan.service';
import { PlanController } from 'src/controllers/Plan.controllers';
import { Team } from 'src/entities/team.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan,Team,User])],
  providers: [PlanService],
  controllers: [PlanController],
})
export class PlanModule {}
