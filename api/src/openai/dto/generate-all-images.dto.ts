import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MealNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class GenerateAllImagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealNameDto)
  @IsNotEmpty()
  meals: MealNameDto[];
}
