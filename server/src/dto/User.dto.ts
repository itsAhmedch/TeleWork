import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, IsIn, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['collab', 'respo','leader'])
  role: string;

  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'mat must be exactly 8 digits' })
  mat: string;

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



  @IsOptional()
  @IsInt()
  idTeam?: number | null;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'mat'] as const)
) {}