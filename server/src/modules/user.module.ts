import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/controllers/user.contoller';
import { UserService } from 'src/services/user.service';
import { User } from 'src/entities/user.entity';
import { Team } from 'src/entities/team.entity';
import { authService } from 'src/services/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TeamService } from 'src/services/Team.service';
import { CreateAdminController } from 'src/controllers/CreateAdmin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Team]), // Register User entity for dependency injection
  ],
  controllers: [UserController,CreateAdminController],
  providers: [UserService,JwtService,authService ],
  
})
export class UserModule {}
