import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';
import { RegenerateMealsDto } from './dto/regenerate-meals.dto';

@Controller('openai') // Defines the base route for this controller (/api/openai)
export class OpenaiController {
    constructor(private readonly openaiService: OpenaiService) {}

    @Post('generate-plan') // Route: POST /api/openai/generate-plan
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Enable validation for this endpoint
    async generatePlan(@Body() generateMealPlanDto: GenerateMealPlanDto) {
        // Pass the whole DTO directly to the service
        return this.openaiService.generateMealPlan(generateMealPlanDto);
    }

    @Post('regenerate-meals') // Route: POST /api/openai/regenerate-meals
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Enable validation for this endpoint
    async regenerateMeals(@Body() regenerateMealsDto: RegenerateMealsDto) {
        // Call the service method with the validated DTO
        return this.openaiService.regenerateMealsService(
            regenerateMealsDto // Pass the whole DTO as the service expects it
        );
    }
}
