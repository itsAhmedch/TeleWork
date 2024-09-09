// src/controller/controller.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { authService } from './auth.service'; // Adjust path as necessary
import { LoginUserDto } from './dto/login-user.dto'; // Adjust path as necessary

@Controller('')
export class authContoller {
  constructor(private readonly authService: authService) {}

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return this.authService.login(loginUserDto);
  }


  
}
