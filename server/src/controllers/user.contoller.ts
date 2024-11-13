import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './../services/user.service';
import { authService } from './../services/auth.service';
import { CreateUserDto, UpdateUserDto } from '../dto/User.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from 'src/entities/team.entity';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { RolesGuard } from 'src/guards/roles-guards';
import { hasRoles } from 'src/guards/decorator/roles.decorator';
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: authService,
    // private readonly authService: authService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  @hasRoles('respo', 'admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {

    const user = await this.userRepository.findOneBy({
      cin: createUserDto.cin,
    });
    if (user) {
      throw new NotFoundException(`cin already exists`);
    } else {
      const user = await this.userRepository.findOneBy({
        email: createUserDto.email,
      });
      if (user) {
        throw new NotFoundException(`email already exists`);
      }
    }

    if (createUserDto.role === 'collab' || createUserDto.role === 'leader') {
      if (createUserDto.idTeam) {
        const Team = await this.teamRepository.findOneBy({
          id: createUserDto.idTeam,
        });
        if (!Team) {
          throw new NotFoundException(`This team is not exist`);
        }
      } else throw new NotFoundException(`idTeam should not be empty`);
    }

    if (createUserDto.role === 'leader') {
      if (createUserDto.idTeam) {
        const leader = await this.userRepository.findOneBy({
          team: { id: createUserDto.idTeam },
          role: 'leader',
        });
        if (leader) {
          throw new NotFoundException(`This team had a leader`);
        }
      } else throw new NotFoundException(`idTeam should not be empty`);
    }

    return await this.userService.create(createUserDto);
  }



  @Get('by-respo') // Adjust the route as necessary
  async getUsersByRespo(
    @Req() request: Request, // Use @Req() to get the request object
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ users: User[]; pages: number }> {
    const token = request.headers['authorization']; // Access the Authorization header
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    const { users, total } = await this.userService.getUsersByRespo(
      token.split(' ')[1], // Remove 'Bearer ' prefix
      search,
      page,
      limit,
    );
    const pages = Math.ceil(total / limit);
    return { users, pages }; // Return users and total for pagination
  }

  @Get('get-Respo')
  @hasRoles('admin')
  async getRespo() {
    return await this.userService.getRespo();
  }
  @Get('get-collabs-Names/:idRespo/:team')
  @hasRoles('admin', 'respo')
  async getcollabsNames(
    @Req() req: Request,
    @Param('idRespo') idRespo: number,
    @Param('team') team: number,
  ) {
    const token = await this.authService.decode(req);
    const respoId = token.id;

    const userRole = token.role;

    if (userRole === 'respo' && respoId != idRespo) {
      throw new ForbiddenException(
        'You are not allowed to access this resource.',
      );
    }

    return await this.userService.getcollabsNames(idRespo, team);
  }

  @Get('get-collabs-Names/')
  @hasRoles('admin')
  async getAllcollabsNames() {
    return await this.userService.getAllcollabsNames();
  }

  @Get('TeamNames/')
  @hasRoles('leader')
  async TeamNames(@Req() req: Request) {
    const token = await this.authService.decode(req);
    const teamId = token.idTeam;
    return await this.userService.TeamNames(teamId);
  }




  @Patch(':id')
  @hasRoles('respo', 'admin')
  async update(@Req() req:Request,@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {

    const existingUser = await this.userRepository.findOne({ where:{id},relations:['team','team.responsable'] });

    if (!existingUser) {
      throw new NotFoundException(`User  not found`);
    }

    const token = await this.authService.decode(req);
    const role = token.role
    if (role === 'respo') {
     
      
    if ( existingUser.team.responsable.id  != token.id) {
      throw new NotFoundException(`you are not allowed to change on this user`);
    }
    }

    return await this.userService.update( updateUserDto,existingUser);
  }

  @Delete(':id')
  @hasRoles('respo', 'admin')
  async remove(@Param('id') id: number) {
    return await this.userService.remove(id);
  }
}
