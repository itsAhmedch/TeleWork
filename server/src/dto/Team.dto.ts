
import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  idTeam: number | null;

  @IsNotEmpty()
  @IsNumber()
  idRespo: number;

  @IsNotEmpty()
  @IsNumber()
  idLeader: number;
}





export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
