// src/serverless.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication, Type } from '@nestjs/common';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

// Create a cached instance for better cold starts
let cachedApp: INestApplication;

async function bootstrap(module: Type<any>): Promise<express.Express> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  // Reuse the app if it exists
  if (!cachedApp) {
    const app = await NestFactory.create(module, adapter, { 
      logger: ['error', 'warn'],
    });
    
    // Standard NestJS setup
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));
    
    await app.init();
    cachedApp = app;
  }
  
  return expressApp;
}

export default function createServerlessFunction(appModule: Type<any>) {
  return async (req: express.Request, res: express.Response) => {
    const expressApp = await bootstrap(appModule);
    expressApp(req, res);
  };
}
