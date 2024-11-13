import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; 
import { Team } from './entities/team.entity'; 
import { UserModule } from './modules/user.module';
import { APP_PIPE } from '@nestjs/core';
import { TeamModule } from './modules/team.module';
import { DailyWorkModule } from './modules/dailyWork.module';
import { PlanModule } from './modules/plan.module';
import { DailyWork } from './entities/DailyWork.entity'; // Add this import if you need it
import { Plan } from './entities/plan.entity';
import { AuthModule } from './modules/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './modules/upload.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT as string, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nest_db2',
      entities: [User, Team, DailyWork,Plan], // List your entities here
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Make it globally available
      envFilePath: '.env', // Path to your .env file
    }),
    UserModule,
    TeamModule,
    DailyWorkModule,
    PlanModule,
    AuthModule,
    UploadModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
