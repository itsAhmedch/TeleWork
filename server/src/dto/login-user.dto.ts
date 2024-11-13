// src/user/dto/login-user.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    pwd: string;
}
