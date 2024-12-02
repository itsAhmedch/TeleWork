import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { User } from './../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/User.dto';
import { JwtService } from '@nestjs/jwt';
import { Team } from 'src/entities/team.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private jwtService: JwtService, // Inject JWT service to decode the token

  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    let team;

    try {
      if (createUserDto.role !== 'admin' && createUserDto.role !== 'respo') {
        team = await this.teamRepository.findOne({
          where: { id: createUserDto.idTeam },
        });
        if (!team) {
          throw new BadRequestException('Team not found');
        }
      }

      // Create the user entity and set the team
      const user = this.userRepository.create({
        ...createUserDto,
        team:
          createUserDto.role === 'collab' || createUserDto.role === 'leader'
            ? team
            : null, // Set the found team here
      });

      await this.userRepository.save(user);
      return { status: 'created' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getUsersByRespo(
    token: string,
    search?: string,
    page: number = 1, // Default value for page
    limit: number = 10, // Default value for limit
  ): Promise<{ users: any[]; total: number }> {
    // Decode the JWT token to extract the respoId
    const decodedToken = (await this.jwtService.decode(token)) as any;
    let MyId = [decodedToken.id]; // Initialize with the decoded user ID
    const role = decodedToken.role;
    let userIds: number[] = []; // Initialize userIds as an empty array
    let respoIds = [];

    if (role === 'admin') {
      // Fetch users based on role 'respo'
      const respoUsers = await this.userRepository.find({
        where: { role: 'respo' },
        relations: ['team'],
        select: ['id'], // Keep only the ID here
      });

      // Map the result to get only the IDs
      respoIds = respoUsers.map((user) => user.id);
      // Combine the initial respoId with those fetched for admins
      userIds = Array.from(new Set([...userIds, ...respoIds])); // Remove duplicates
    }
    if (respoIds.length === 0) {
      respoIds = MyId;
    }

    // Fetch teams where the responsible user is the specified respo
    const teams = await this.teamRepository.find({
      where: { responsable: { id: In(respoIds) } },
      relations: ['childTeams'],
    });

    const teamIds = teams.map((team) => team.id);

    // If no teams found, return early with empty result
    if (teamIds.length !== 0) {
      // Fetch users based on team IDs
      const usersInTeams = await this.userRepository.find({
        where: { team: In(teamIds) },
        relations: ['team'],
      });

      // Collect user IDs from usersInTeams
      userIds = Array.from(
        new Set([...userIds, ...usersInTeams.map((user) => user.id)]),
      ); // Combine and remove duplicates
    }

    if (userIds.length === 0) {
      return { users: [], total: 0 }; // Return early if no users found
    }

    // Set up the find options for filtering and pagination
    const findOptions: FindManyOptions<User> = {
      where: { id: In(userIds) }, // Only get users that are in the userIds
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'mat', 'email', 'name', 'lastName', 'role', 'team'],
      relations: ['team', 'team.parentTeam'], // Specify the relation to be included
    };

    // If a search term is provided, filter users by various fields
    if (search) {
      findOptions.where = [
        { id: In(userIds), email: Like(`%${search}%`) },
        { id: In(userIds), name: Like(`%${search}%`) },
        { id: In(userIds), lastName: Like(`%${search}%`) },
        { id: In(userIds), mat: Like(`%${search}%`) },
        { id: In(userIds), team: { name: Like(`%${search}%`) } },
        { id: In(userIds), role: Like(`%${search}%`) },
        {
          id: In(userIds),
          team: { parentTeam: { name: Like(`%${search}%`) } },
        },
      ] as FindOptionsWhere<User>[];
    }

    // Retrieve users and total count for pagination
    const [users, total] = await this.userRepository.findAndCount(findOptions);

    // Map the result to ensure a clear format
    const result = users.map((user) => ({
      id: user.id,
      mat: user.mat,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      team: user.team ? user.team.name : null,
      parentTeam:
        user.team && user.team.parentTeam ? user.team.parentTeam.name : null,
    }));

    return { users: result, total };
  }

  async getRespo() {
    //fetch responsibles
    const respos = await this.userRepository.find({
      where: { role: 'respo' },
    });

    const result = respos.map((user) => ({
      id: user.id,
      fullname: user.name + ' ' + user.lastName,
    }));

    return result;
  }

  async getcollabsNames(idRespo: number, teamId: number | null) {
    let users: any;
    let result = [];
    if (teamId != -1) {
      // Fetch users with roles 'collab' or 'leader' associated with the specified responsable
      users = await this.userRepository.find({
        where: {
          role: In(['collab', 'leader']),
          team: { id: teamId, responsable: { id: idRespo } },
        },
        relations: ['team', 'team.responsable'],
      });

      // Check if the specified team has child teams
      const hasChildTeams = await this.teamRepository.find({
        where: {
          id: Not(teamId),
          responsable: { id: idRespo },
          parentTeam: { id: teamId },
        },
        relations: ['parentTeam', 'childTeams'],
      });

      if (hasChildTeams.length > 0) {
        // If there are child teams, fetch users from each child team
        for (const team of hasChildTeams) {
          const childTeamUsers = await this.userRepository.find({
            where: {
              role: In(['collab', 'leader']),
              team: { id: team.id },
            },
            relations: ['team', 'team.responsable'],
          });

          // Map the child team users to the desired format and track unique IDs
          for (const user of childTeamUsers) {
            result.push({
              id: user.id,
              fullname: `${user.name} ${user.lastName}`,
              mat: user.mat,
            });
          }
        }
      }
    } else {
      // Fetch users with roles 'collab' or 'leader' associated with the specified responsable
      users = await this.userRepository.find({
        where: {
          role: In(['collab', 'leader']),
          team: { responsable: { id: idRespo } },
        },
        relations: ['team', 'team.responsable'],
      });
    }
    // Map the users to the desired format and track unique IDs
    for (const user of users) {
      result.push({
        id: user.id,
        fullname: `${user.name} ${user.lastName}`,
        mat: user.mat,
      });
    }

    return result;
  }
  async getAllcollabsNames() {
    let result = [];
    // Fetch users with roles 'collab' or 'leader' associated with the specified responsable
    const users = await this.userRepository.find({
      where: {
        role: In(['collab', 'leader']),
      },
      relations: ['team', 'team.responsable'],
    });

    // Map the users to the desired format and track unique IDs
    for (const user of users) {
      result.push({
        id: user.id,
        fullname: `${user.name} ${user.lastName}`,
        mat: user.mat,
      });
    }

    return result;
  }
  async TeamNames(idTeam: number) {
    let result = [];
    // Fetch users with roles 'collab' or 'leader' associated with the specified responsable
    const users = await this.userRepository.find({
      where: {
        team: { id: idTeam },
      },
      relations: ['team'],
    });

    // Map the users to the desired format and track unique IDs
    for (const user of users) {
      result.push({
        id: user.id,
        fullname: `${user.name} ${user.lastName}`,
        mat: user.mat,
      });
    }

    return result;
  }

  async update(
    updateUserDto: UpdateUserDto,
    existingUser: User,
  ): Promise<{ status: string }> {
    try {
      if (
        (existingUser.role === 'respo' &&
          updateUserDto.role &&
          updateUserDto.role !== existingUser.role) ||
        updateUserDto.role === 'respo'
      ) {
        throw new NotFoundException(`you cannot  change the role`);
      }

      if (updateUserDto.role && updateUserDto.role === 'leader') {
        const leader = await this.userRepository.findOne({
          where: {
            id: Not(existingUser.id),
            role: 'leader',
            team: {
              id: existingUser.team.id,
            },
          },
          relations: ['team'], // Ensure the 'team' relation is loaded
        });

        if (leader) {
          throw new NotFoundException(`This team had a leader`);
        }
      }

      const updatedUser = this.userRepository.create({
        ...existingUser,
        ...updateUserDto,
      });

      await this.userRepository.save(updatedUser);
      return { status: 'updated' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (user) {
        if (user.role === 'respo') {
          const hasteam = this.teamRepository.findOne({
            where: { responsable: { id: id } },
            relations: ['responsable'],
          });
          if (hasteam) {
            throw new BadRequestException('You must delete all teams associated with this responsible first.');
          }
          // If the user is a 'collab' or 'leader', no need to worry about deleting their data 
          // because the 'onDelete: CASCADE' relation will automatically handle the deletion of related entities.

        } 
      } else {
        throw new NotFoundException(`user with ID ${id} not found`);
      }
      await this.userRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
