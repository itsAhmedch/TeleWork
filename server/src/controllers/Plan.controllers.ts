import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
  Res,
} from '@nestjs/common';
import { PlanService } from 'src/services/Plan.service';
import { authService } from 'src/services/auth.service';

import { Plan } from 'src/entities/plan.entity';

import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';
import { hasRoles } from 'src/guards/decorator/roles.decorator';
import { ExtractDataService } from 'src/services/ExtractData.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plan')
export class PlanController {
  constructor(
    private readonly planService: PlanService,
    private readonly authService: authService,
    private readonly extractDataService: ExtractDataService,
  ) {}

  @Post('SavePlan/:respo')
  @hasRoles('respo', 'admin', 'leader')
  async savePlan(
    @Req() req: Request,
    @Param('respo') idSender: number,
    @Body()
    {
      planChanges,
    }: { planChanges: { CollabId: number; date: string; action: string }[] }, // Destructure to directly get planChanges
  ): Promise<{ message: string }> {
    const token = await this.authService.decode(req);
    const userId = token.id;
    const role = token.role;

    // Check if the role is 'respo' or 'leader' and ensure the user is authorized to act for the given respo
    if (['respo', 'leader'].includes(role) && idSender != userId) {
      throw new ForbiddenException(
        `You are not allowed to perform this action`,
      );
    }

    const isProposal = role == 'leader'; // Using a simple conditional assignment

    // Delegate the plan changes to the service
    await this.planService.processPlanChanges(planChanges, isProposal);

    return { message: 'Plan changes saved successfully' };
  }

  @Post('/get-Plans/:respo')
  @hasRoles('respo', 'admin', 'leader')
  async getPlans(
    @Req() req: Request,
    @Param('respo') idSender: number,
    @Body() body: { isProposal: boolean; idsTeams: number[] },
  ): Promise<Plan[]> {
    const { idsTeams, isProposal } = body;
    const token = await this.authService.decode(req);
    const userId = token.id;
    const role = token.role;

    // Check if the role is 'respo' or 'leader' and ensure the user is authorized to act for the given respo
    if (['respo', 'leader'].includes(role) && idSender != userId) {
      throw new ForbiddenException(
        `You are not allowed to perform this action`,
      );
    }

    return this.planService.getPlans(idsTeams, isProposal);
  }

  @Post()
  @hasRoles('admin')
  findAll(@Body() body: { isProposal: boolean }): Promise<Plan[]> {
    const isProposal = body.isProposal;

    return this.planService.findAll(isProposal);
  }

  @Get('/MyPlans/')
  @hasRoles('leader', 'collab')
  async GetMyPlans(@Req() req: Request): Promise<any[]> {
    const token = await this.authService.decode(req);
    return this.planService.findByCollab(token.id, false);
  }
  @Get('/my-proposal-plans/')
  @hasRoles('leader', 'collab')
  async GetMyProposalPlans(@Req() req: Request): Promise<any[]> {
    const token = await this.authService.decode(req);
    return this.planService.findByCollab(token.id, true);
  }

  @Get('LeaderTeam')
  @hasRoles('leader')
  async findByTeam(@Req() req: Request): Promise<any[]> {
    const token = await this.authService.decode(req);
    const IdTeam = token.idTeam; // You are getting the team ID from the token
    return this.planService.findByTeam(IdTeam); // Ensure this is the correct method
  }

  @Get('/exportTeamPlanToExcel')
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

    return await this.extractDataService.ExtractPlan(
      res,
      idRespo,
      teamId,
      start,
      end,
    );
  }
}
