// src/controller/controller.controller.ts

import { Controller, Post, Body, Req } from '@nestjs/common';
import { authService } from 'src/services/auth.service'; // Adjust path as necessary
import { LoginUserDto } from '../dto/login-user.dto'; // Adjust path as necessary

@Controller('')
export class authController {
  constructor(private readonly authService: authService) {}

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return this.authService.login(loginUserDto);
  }

  @Post('/logout')
  async logout(@Req() req: Request): Promise<any> {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];

    return this.authService.logout(token);
  }
}
