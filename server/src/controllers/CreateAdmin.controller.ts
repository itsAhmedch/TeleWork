import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { User } from 'src/entities/user.entity';

import { Repository } from 'typeorm';

class createAdminDto {
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'CIN must be exactly 8 digits' })
  cin: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 special character, and be at least 8 characters long',
  })
  pwd: string;
}

@Controller('/createAdmin')
export class CreateAdminController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // For Postman :
  //  {
  // "cin": "10000022",
  //   "email": "admin1@admin.com",
  //   "name": "admin",
  //   "lastName": "admin",
  //   "pwd": "123456A@"
  // };

  @Post()
  async createAdmin(@Body() createAdminDto: createAdminDto) {
    const user = await this.userRepository.findOneBy({
      cin: createAdminDto.cin,
    });
    if (user) {
      throw new NotFoundException(`cin already exists`);
    } else {
      const user = await this.userRepository.findOneBy({
        email: createAdminDto.email,
      });
      if (user) {
        throw new NotFoundException(`email already exists`);
      }
    }

    const admin = this.userRepository.create({
      role: 'admin',
      ...createAdminDto,
      team: null,
    });

    return await this.userRepository.save(admin);
  }
}
