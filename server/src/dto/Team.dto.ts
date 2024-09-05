
import { OmitType, PartialType } from '@nestjs/mapped-types';
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

  @IsOptional()
  @IsNumber()
  idLeader: number | null;
}





// UpdateTeamDto that omits idRespo and idTeam fields
export class UpdateTeamDto extends PartialType(
  OmitType(CreateTeamDto, ['idRespo', 'idTeam'] as const)
) {}