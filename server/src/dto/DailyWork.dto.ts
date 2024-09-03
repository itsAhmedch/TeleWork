import { IsInt, IsBoolean, IsString, IsDateString } from 'class-validator';

export class CreateDailyWorkDto {
  @IsInt()
  idCollab: number;


  @IsBoolean()
  workStatus: boolean;
}
