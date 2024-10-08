import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { DailyWorkService } from 'src/services/DailyWork.service';
import { DailyWorkController } from 'src/controllers/DailyWork.controller';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([DailyWork,User])],
  providers: [DailyWorkService,UserService],
  controllers: [DailyWorkController],
})
export class DailyWorkModule {}
