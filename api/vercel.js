// vercel.js - Consolidated serverless entry point
const { createServer } = require('http');
const { Server } = require('socket.io');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('./dist/api/src/app.module');

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

let cachedNestApp = null;

async function bootstrap() {
  if (!cachedNestApp) {
    const app = await NestFactory.create(AppModule, adapter);
    app.enableCors();
    await app.init();
    cachedNestApp = app;
  }
  return expressApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  return app(req, res);
};
