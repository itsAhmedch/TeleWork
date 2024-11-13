import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

import { LoginUserDto } from 'src/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class authService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { email, pwd } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email: email },
      relations: ['team'],
    });

    // If user is still not found, throw UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid =
      user && user.pwd ? await bcrypt.compare(pwd, user.pwd) : false;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.name + ' ' + user.lastName,
      id: user.id,
      role: user.role,
      idTeam: user.team?.id,
    };


    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async decode(request): Promise<any> {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.split(' ')[1]; // Assuming the token is sent as "Bearer <token>"

    const decodedToken = (await this.jwtService.decode(token)) as any;

    return decodedToken;
  }

  logout(token){
    console.log("logout :",token);
    
  }
}
