import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {
    const falKey = this.configService.get<string>('FAL_KEY');
    console.log(`FAL Key Loaded: ${falKey ? '*********' + falKey.slice(-4) : 'Not Found'}`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
