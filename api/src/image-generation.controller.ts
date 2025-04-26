import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ImageGenerationService } from './image-generation.service';
import { GenerateImageDto } from './image-generation/dto/generate-image.dto';

@Controller('image-generation')
export class ImageGenerationController {
  private readonly logger = new Logger(ImageGenerationController.name);

  constructor(private readonly imageGenerationService: ImageGenerationService) {}

  @Post('generate') // Define the POST endpoint route
  @HttpCode(HttpStatus.OK) // Set default success status code to 200 OK
  async generateImage(@Body() generateImageDto: GenerateImageDto): Promise<{ imageUrl: string | null }> {
    this.logger.log(`Received image generation request for prompt: ${generateImageDto.prompt.substring(0, 50)}...`);
    try {
      const imageUrl = await this.imageGenerationService.generateMealImage(
        generateImageDto.prompt,
      );
      return { imageUrl };
    } catch (error) {
      this.logger.error(`Error in generateImage endpoint: ${error.message}`, error.stack);
      // The service already throws InternalServerErrorException, which NestJS handles
      throw error;
    }
  }
}
