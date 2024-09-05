import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/controllers/user.contoller';
import { UserService } from 'src/services/user.service';
import { User } from 'src/entities/user.entity';
import { Team } from 'src/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Team]), // Register User entity for dependency injection
  ],
  controllers: [UserController],
  providers: [UserService],
  
})
export class UserModule {}
