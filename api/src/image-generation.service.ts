import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fal } from '@fal-ai/client'; // Import fal

@Injectable()
export class ImageGenerationService {
  private readonly logger = new Logger(ImageGenerationService.name);
  private isInitialized = false; // Flag to track initialization

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('FAL_KEY');
    if (!apiKey) {
      this.logger.error('FAL_KEY environment variable not set!');
      // Service remains uninitialized
    } else {
      // Configure the global fal instance with credentials
      fal.config({
        credentials: apiKey,
      });
      this.isInitialized = true; // Mark as initialized
      this.logger.log('FAL client configured successfully.');
    }
  }

  async generateMealImage(prompt: string): Promise<string | null> {
    if (!this.isInitialized) { // Check initialization flag
      this.logger.error('FAL client not initialized. Check API Key configuration.');
      throw new InternalServerErrorException('Image generation service not configured.');
    }

    this.logger.log(`Generating image for prompt: ${prompt.substring(0, 50)}...`);

    try {
      // Use the configured global fal instance
      const result: any = await fal.subscribe('fal-ai/hidream-i1-fast', {
        input: {
          prompt: prompt,
          negative_prompt: 'blurry, low quality, cartoon, drawing, illustration, sketch, unrealistic, text, words, letters, deformed, multiple dishes, hands',
          image_size: 'square_hd', // High-res square
          output_format: 'jpeg',
          num_images: 1,
        },
        logs: false, // Set to true for debugging fal logs
      });

      this.logger.log(`Image generation successful. Request ID: ${result.requestId}`);

      if (result?.images && result.images.length > 0 && result.images[0].url) {
        return result.images[0].url;
      } else {
        this.logger.error('FAL API returned unexpected result structure:', result);
        throw new InternalServerErrorException('Failed to extract image URL from FAL response.');
      }
    } catch (error) {
      this.logger.error('Error calling FAL AI API:', error);
      // Check for specific FAL error types if available
      // Example: if (error instanceof FalError) { ... }
      throw new InternalServerErrorException('Failed to generate image via FAL AI.');
    }
  }
}
