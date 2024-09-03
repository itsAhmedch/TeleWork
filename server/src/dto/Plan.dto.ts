import { IsInt, IsBoolean, IsDate, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsInt()
  idTeam: number;

  @IsInt()
  idCollab: number;

  @IsString()
  date: string; 

  @IsBoolean()
  proposal: boolean;
}




export class UpdatePlanDto extends PartialType(CreatePlanDto) {}