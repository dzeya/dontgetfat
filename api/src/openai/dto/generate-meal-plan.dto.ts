import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class GenerateMealPlanDto {
  @IsString()
  @IsNotEmpty()
  diet: string;

  @IsNumber()
  @Min(1)
  servings: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  calories?: number; // Optional, but must be a positive number if provided

  @IsString()
  @IsOptional()
  dislikes?: string;

  @IsString()
  @IsOptional()
  preferences?: string;
}
