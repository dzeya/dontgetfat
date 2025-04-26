import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, Min, IsNotEmpty, IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';

// Define a DTO for the nested preferences object
class RegeneratePreferencesDto {
    @IsString()
    @IsNotEmpty()
    diet: string;

    @IsNumber()
    @Min(1)
    servings: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    calories?: number;

    @IsString()
    @IsOptional()
    dislikes?: string;

    @IsString()
    @IsOptional()
    preferences?: string; // Keeping this based on service structure
}

export class RegenerateMealsDto {
    @ValidateNested()
    @Type(() => RegeneratePreferencesDto)
    @IsNotEmpty()
    preferences: RegeneratePreferencesDto;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    mealTypesToRegenerate: string[];

    @IsArray()
    @IsString({ each: true })
    previousMealNames: string[]; // Can be empty
}
