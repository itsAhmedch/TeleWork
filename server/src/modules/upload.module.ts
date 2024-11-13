import { Module } from '@nestjs/common';
import { UploadController } from 'src/controllers/upload.controller';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';



@Module({
  controllers: [UploadController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class UploadModule {}
