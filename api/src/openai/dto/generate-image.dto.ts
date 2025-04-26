import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  mealName: string;
}
