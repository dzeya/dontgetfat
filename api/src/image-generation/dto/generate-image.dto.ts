import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
