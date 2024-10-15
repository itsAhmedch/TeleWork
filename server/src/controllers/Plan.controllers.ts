import { Controller, Get, Post, Body, Param, Delete, NotFoundException, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PlanService } from 'src/services/Plan.service';
import { authService } from 'src/services/auth.service';
import { CreatePlanDto, UpdatePlanDto } from 'src/dto/Plan.dto';
import { Plan } from 'src/entities/plan.entity';
import { Team } from 'src/entities/team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';
import { hasRoles } from 'src/guards/decorator/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('plan')
export class PlanController {

  constructor(private readonly planService: PlanService,
    private readonly authService: authService,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // @Post()
  // @hasRoles('respo','admin','leader')
  // async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    // // Check if the team exists
    // const team = await this.teamRepository.findOne({ where: { id: createPlanDto.idTeam } });
    // if (!team) {
    //   throw new NotFoundException(`Team with ID ${createPlanDto.idTeam} not found`);
    // }

    // // Check if the collaborator (collab) exists
    // const collab = await this.userRepository.findOne({ where: { id: createPlanDto.idCollab } });
    // if (!collab) {
    //   throw new NotFoundException(`Collaborator with ID ${createPlanDto.idCollab} not found`);
    // }

    // return this.planService.create(createPlanDto,team,collab);
  // }
  @Post('SavePlan/:respo')
  @hasRoles('respo','admin','leader')
  async savePlan(
    @Req() req: Request,
    @Param('respo') idSender: number,
    @Body() { planChanges }: { planChanges: { CollabId: number; date: string; action: string }[] } // Destructure to directly get planChanges
  ): Promise<{ message: string }> {
    const token = await this.authService.decode(req);
    const userId = token.id;
    const role = token.role;

   
    // Check if the role is 'respo' or 'leader' and ensure the user is authorized to act for the given respo
    if (['respo', 'leader'].includes(role) && idSender != userId) {
      throw new ForbiddenException(`You are not allowed to perform this action`);
    }

    const isProposal = role == 'leader'; // Using a simple conditional assignment

    // Delegate the plan changes to the service
    await this.planService.processPlanChanges(planChanges, isProposal);

    return { message: 'Plan changes saved successfully' };
  }


  @Post('/get-Plans/:respo')
  @hasRoles('respo','admin','leader')
  async getPlans(@Req() req: Request,@Param('respo') idSender: number, @Body() body: { isProposal: boolean, idsTeams: number[] }): Promise<Plan[]> {
    const { idsTeams,isProposal } = body; 
    const token = await this.authService.decode(req);
    const userId = token.id;
    const role = token.role;

    // Check if the role is 'respo' or 'leader' and ensure the user is authorized to act for the given respo
    if (['respo', 'leader'].includes(role) && idSender != userId) {

      throw new ForbiddenException(`You are not allowed to perform this action`);
    }

    
    console.log(idsTeams,'fffffffffffffff');
    
    return this.planService.getPlans(idsTeams,isProposal);
  }

  @Get()
  @hasRoles('admin')
  findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }

  @Get(':id')
  @hasRoles('respo','admin','leader')
  findOne(@Param('id') id: number): Promise<Plan> {
    return this.planService.findOne(id);
  }

  @Get('/ByCollab/:id')
  @hasRoles('respo','admin','leader')
  findByCollab(@Param('id') id: number): Promise<Plan[]> {
    return this.planService.findByCollab(id);
  }



  @Get('/LeaderTeam')
  @hasRoles('leader')
  async findByTeam(@Req() req: Request): Promise<any[]> {
    console.log("Log from findByTeam"); // This should log
    const token = await this.authService.decode(req);
    const IdTeam = token.idTeam; // You are getting the team ID from the token
    return this.planService.findByTeam(IdTeam); // Ensure this is the correct method
  }
  


  @Delete(':id')
  @hasRoles('respo','admin','leader')
  remove(@Param('id') id: number): Promise<void> {
    return this.planService.remove(id);
  }
}
