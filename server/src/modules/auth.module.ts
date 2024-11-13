import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/entities/user.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { authService } from 'src/services/auth.service'; 
import { authController } from '../controllers/auth.controller'; 
import { RolesGuard } from 'src/guards/roles-guards';
import { JwtAuthGuard } from 'src/guards/jwt-guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') , // Use your JWT_SECRET here
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [authController],
  providers: [authService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [authService, JwtModule],
})
export class AuthModule {}
