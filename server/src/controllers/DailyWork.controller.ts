import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Query,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { DailyWorkService } from 'src/services/DailyWork.service';

import { DailyWork } from 'src/entities/DailyWork.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';
import { hasRoles } from 'src/guards/decorator/roles.decorator';
import { authService } from 'src/services/auth.service';

import { ExtractDataService } from 'src/services/ExtractData.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Daily-Work')
export class DailyWorkController {
  constructor(
    private readonly DailyWorkService: DailyWorkService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private authService: authService,
    private extractDataService: ExtractDataService,
  ) {}

  @Post()
  @hasRoles('collab', 'leader')
  async create(@Req() req: Request): Promise<DailyWork> {
    const token = await this.authService.decode(req);

    // Fetch the user by ID
    const user = await this.userRepository.findOne({
      where: { id: token.id, role: In(['collab', 'leader']) },
    });

    // Handle the error and throw HttpException
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.DailyWorkService.create(user);
  }
  @Get('get-my-status')
  @hasRoles('collab', 'leader')
  async getMyStatus(@Req() req: Request): Promise<any> {
    const token = await this.authService.decode(req);

    // Fetch the user by ID
    const user = await this.userRepository.findOne({
      where: { id: token.id, role: In(['collab', 'leader']) },
    });

    // Handle the error and throw HttpException
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.DailyWorkService.getMyStatus(user);
  }
  @Get('get-day-status/:date')
  @hasRoles('collab', 'leader')
  async getDayStatus(@Req() req: Request,@Param('date') date:string): Promise<any> {
    const token = await this.authService.decode(req);

    // Fetch the user by ID
    const user = await this.userRepository.findOne({
      where: { id: token.id, role: In(['collab', 'leader']) },
    });

    // Handle the error and throw HttpException
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.DailyWorkService.getDayStatus(user,date);
  }

  @Get('/by-Collab/:id')
  @hasRoles('respo', 'admin')
  async findByCollab(@Param('id') id: number): Promise<DailyWork[]> {
    return this.DailyWorkService.findByCollab(id);
  }

  @Get('/exportTeamTimes')
  @hasRoles('admin', 'respo')
  async exportTeamPlanToExcel(
    @Req() req: Request,
    @Res() res: Response,
    @Query('idRespo') idRespo: number,
    @Query('idTeam') teamId: number,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const token = await this.authService.decode(req);

    if (token.role === 'respo' && idRespo != token.id) {
      throw new ForbiddenException(
        `You are not allowed to perform this action`,
      );
    }

    return await this.extractDataService.ExtractTimes(
      res,
      idRespo,
      teamId,
      start,
      end,
    );
  }
}
