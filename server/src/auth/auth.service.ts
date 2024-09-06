import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

import { LoginUserDto } from './dto/login-user.dto';
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

    let user = await this.userRepository.findOneBy({ email: email });

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

    // Prepare payload
 
    
    const payload = {
      username: user.name + ' ' + user.lastName,
      sub: user.id,
      role: user.role,
      idTeam: user.idTeam,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
