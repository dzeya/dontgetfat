import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto'; // Import DTOs
import { RegenerateMealsDto } from './dto/regenerate-meals.dto';   // Import DTOs
import { GenerateImageDto } from './dto/generate-image.dto'; // Import DTO
import { GenerateAllImagesDto } from './dto/generate-all-images.dto'; // Import new DTO
import * as falClient from '@fal-ai/serverless-client';
import { Meal, MealPlan, DayPlan } from '../../../types/meal'; // Import shared types
import type { AxiosResponse } from 'axios';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly openAIApiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly openAIApiKey: string;
  private readonly falKey: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Fetch API Key securely from environment variables
    this.openAIApiKey = this.configService.get<string>('OPENAI_API_KEY')!;
    if (!this.openAIApiKey) {
      this.logger.error('OPENAI_API_KEY not found in environment variables.');
      throw new Error('Server configuration error: OpenAI API Key is missing.');
    }
    // Fetch Fal AI Key
    this.falKey = this.configService.get<string>('FAL_KEY')!;
    if (!this.falKey) {
      this.logger.warn('FAL_KEY not found in environment variables. Image generation will be skipped.');
      // Don't throw an error, allow the service to function without image generation
    }
  }

  // Use the DTO for the parameter type
  async generateMealPlan(dto: GenerateMealPlanDto): Promise<MealPlan> {
    const { diet, servings, calories, dislikes, preferences } = dto;

    const requestBody = {
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' as const }, // Ensure correct type
      messages: [
        {
          role: 'system',
          content: 'You are an expert meal planning assistant. Generate a meal plan based on user requirements. Respond ONLY with a single, valid JSON object adhering to the specified schema. Do NOT include any text before or after the JSON object. The required schema is: {"days":[{"day": number,"meals":[{"type":"breakfast | lunch | dinner | snack","name": string,"ingredients":[string],"estimated_time": number}]}]}',
        },
        {
          role: 'user',
          content: `Generate a meal plan based on the following user requirements. IMPORTANT: Pay close attention to the 'Additional Preferences' regarding the desired number of days or specific cooking days for the plan.
Diet: ${diet}
Household Size: ${servings}
Calories per day (approximate total): ${calories || 'not specified'}
Disliked Ingredients: ${dislikes || 'none'}
Additional Preferences: ${preferences || 'none'}
Output ONLY the JSON object conforming to the schema provided in the system message. The JSON structure should represent the requested plan duration (e.g., if preferences ask for 2 days, the JSON should contain exactly 2 day objects).`, 
        },
      ],
    };

    this.logger.log('Sending request to OpenAI for meal plan generation...');

    try {
      const response = await fetch(this.openAIApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openAIApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const statusCode = response.status;
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        
        this.logger.error(`OpenAI API error: ${statusCode}`, errorData);
        if (statusCode === 401) {
          throw new UnauthorizedException('Invalid OpenAI API key or access denied.');
        }
        throw new InternalServerErrorException(`OpenAI API error: ${statusCode}`);
      }
      
      const responseData = await response.json();
      const content = responseData.choices?.[0]?.message?.content;
      
      if (!content) {
        this.logger.error('OpenAI response missing content.', responseData);
        throw new InternalServerErrorException('Failed to parse meal plan: OpenAI response was empty.');
      }
      
      try {
        // Assuming response_format: json_object works as expected
        return JSON.parse(content) as MealPlan;
      } catch (err) {
        this.logger.error('Failed to parse JSON from OpenAI response:', err, content);
        throw new InternalServerErrorException(`Failed to parse meal plan. Invalid JSON received: ${content}`);
      }
    } catch (error: any) {
        // Catch errors thrown or synchronous errors
        this.logger.error('Error during OpenAI request execution:', error);
        // Re-throw if it's already a NestJS exception, otherwise wrap it
        if (error.response && error.status) throw error;
        throw new InternalServerErrorException('An unexpected error occurred while generating the meal plan.');
    }
  }

  // --- New method for On-Demand Image Generation ---
  async generateMealImage(dto: GenerateImageDto): Promise<{ imageUrl: string | null }> {
    const { mealName } = dto;
    this.logger.log(`Generating image for meal: ${mealName}...`);

    if (!this.falKey) {
      this.logger.warn('Fal AI key missing, cannot generate image.');
      throw new InternalServerErrorException('Image generation is not configured.');
    }

    try {
        falClient.config({ credentials: this.falKey });

        const result: any = await falClient.subscribe('fal-ai/fast-sdxl', {
            input: {
                prompt: `${mealName}, food photography, high detail, delicious looking`,
            },
            logs: false,
        });

        if (result?.images?.[0]?.url) {
            this.logger.log(`Generated image for ${mealName}: ${result.images[0].url}`);
            return { imageUrl: result.images[0].url };
        } else {
            this.logger.warn(`Fal AI response missing URL for ${mealName}.`, result);
            throw new InternalServerErrorException('Failed to get image URL from generation service.');
        }
    } catch (error) {
        this.logger.error(`Fal AI error generating image for ${mealName}:`, error);
        throw new InternalServerErrorException(`Failed to generate image for ${mealName}.`);
    }
  }

  // --- New method for Bulk On-Demand Image Generation ---
  async generateAllMealImages(dto: GenerateAllImagesDto): Promise<Record<string, string | null>> {
    this.logger.log(`Generating images for ${dto.meals.length} meals...`);

    if (!this.falKey) {
      this.logger.warn('Fal AI key missing, cannot generate images.');
      throw new InternalServerErrorException('Image generation is not configured.');
    }

    falClient.config({ credentials: this.falKey });

    const imageResults: Record<string, string | null> = {};
    const generationPromises = dto.meals.map(async (meal) => {
      const mealName = meal.name;
      try {
        const result: any = await falClient.subscribe('fal-ai/fast-sdxl', {
          input: {
            prompt: `${mealName}, food photography, high detail, delicious looking`,
          },
          logs: false,
        });

        if (result?.images?.[0]?.url) {
          this.logger.log(`Generated image for ${mealName}`);
          imageResults[mealName] = result.images[0].url;
        } else {
          this.logger.warn(`Fal AI response missing URL for ${mealName}.`);
          imageResults[mealName] = null; // Mark as failed/not found
        }
      } catch (error) {
        this.logger.error(`Fal AI error generating image for ${mealName}:`, error);
        imageResults[mealName] = null; // Mark as failed
      }
    });

    // Wait for all image generation attempts to complete
    await Promise.all(generationPromises);

    this.logger.log('Finished generating all meal images.');
    return imageResults;
  }

  // Use the DTO for the parameter type
  async regenerateMealsService(dto: RegenerateMealsDto): Promise<Meal[]> {
    const { preferences, mealTypesToRegenerate, previousMealNames } = dto;

    const promptContent = `Regenerate ${mealTypesToRegenerate.length} meals based on the following user preferences:
Diet: ${preferences.diet}
Household Size: ${preferences.servings}
Calories per day (approximate total for a full day plan, use as guide): ${preferences.calories || 'not specified'}
Disliked Ingredients: ${preferences.dislikes || 'none'}
Additional Preferences: ${preferences.preferences || 'none'}

Specifically, generate one meal for each of the following types in order: ${mealTypesToRegenerate.join(', ')}.
Try to provide different meals than these previous ones: ${previousMealNames.join(', ')}.

Required JSON Schema for the output: an object containing a key "meals" which holds an array of Meal objects, where each Meal object is {"type": string, "name": string, "ingredients": [string], "estimated_time": number}.
Output ONLY the JSON object. Do NOT include any text before or after the JSON object.`;


    const requestBody = {
        model: 'gpt-4o',
        temperature: 0.8,
        max_tokens: 1024,
        response_format: { type: 'json_object' as const },
        messages: [
          {
            role: 'system',
            content: 'You are a meal planning assistant. Generate replacement meals based on user preferences and requested meal types. Respond ONLY with a single, valid JSON object containing a key "meals" which holds an array of Meal objects adhering to the schema: {"type": string, "name": string, "ingredients": [string], "estimated_time": number}. Do NOT include any other text.'
          },
          {
            role: 'user',
            content: promptContent
          }
        ],
    };

    this.logger.log('Sending request to OpenAI for meal regeneration...');

    try {
        const response = await fetch(this.openAIApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.openAIApiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const statusCode = response.status;
            let errorData: any;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = await response.text();
            }
            
            this.logger.error(`OpenAI API error (regenerate): ${statusCode}`, errorData);
            if (statusCode === 401) {
                throw new UnauthorizedException('Invalid OpenAI API key or access denied.');
            }
            throw new InternalServerErrorException(`OpenAI API error during regeneration: ${statusCode}`);
        }

        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content;

        if (!content) {
            this.logger.error('OpenAI regeneration response missing content.', responseData);
            throw new InternalServerErrorException('Failed to parse regenerated meals: OpenAI response was empty.');
        }

        try {
            const parsedObject = JSON.parse(content);
            if (parsedObject && Array.isArray(parsedObject.meals)) {
                if (parsedObject.meals.length === mealTypesToRegenerate.length) {
                    return parsedObject.meals as Meal[];
                } else {
                    this.logger.error(`Expected ${mealTypesToRegenerate.length} meals, received ${parsedObject.meals.length}`, parsedObject.meals);
                    throw new InternalServerErrorException(`AI returned an incorrect number of meals. Expected ${mealTypesToRegenerate.length}, got ${parsedObject.meals.length}`);
                }
            } else {
                this.logger.error('Parsed JSON does not contain a "meals" array:', parsedObject);
                throw new InternalServerErrorException('AI response structure was invalid (missing "meals" array).');
            }
        } catch (err) {
            this.logger.error('Failed to parse regeneration JSON:', err, content);
            throw new InternalServerErrorException(`Failed to parse regenerated meals. Invalid JSON received: ${content}`);
        }
    } catch (error: any) {
        this.logger.error('Error during OpenAI regeneration request execution:', error);
        if (error.response && error.status) throw error;
        throw new InternalServerErrorException('An unexpected error occurred while regenerating meals.');
    }
  }
}
