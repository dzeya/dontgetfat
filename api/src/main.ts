import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global DTO validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatically transform payloads to DTO instances
    whitelist: true, // Strip properties that do not have any decorators
    // forbidNonWhitelisted: true, // Optional: Throw an error if non-whitelisted properties are present
  }));

  // Enable CORS for frontend (adjust origin as needed for production)
  const allowedOrigins = [
    'http://localhost:5173', // Vite default dev port
    /^http:\/\/localhost:\d+$/, // Allow any localhost port
    /^http:\/\/127\.0\.0\.1:\d+$/, // Browser preview proxy
    /^https:\/\/[a-zA-Z0-9-]+(-[a-zA-Z0-9]+)*\.vercel\.app$/, // Standard Vercel previews/deployments
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Check if origin is in the allowed list or matches the regex
      if (allowedOrigins.some(allowedOrigin => 
          typeof allowedOrigin === 'string' ? allowedOrigin === origin : allowedOrigin.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`); // Add a log for the running port
}
bootstrap();
