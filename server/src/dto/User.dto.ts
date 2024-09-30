import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, IsIn, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['collab', 'admin', 'respo','leader'])
  role: string;

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

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'cin'] as const)
) {}