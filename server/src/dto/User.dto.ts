import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['collab', 'admin', 'respo'])
  role: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  pwd: string;

  @IsOptional()
  @IsString()
  serviceName?: string | null;

  @IsOptional()
  @IsInt()
  idTeam?: number | null;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
