// vercel.js - Single serverless function entrypoint for the entire API
const path = require('path');
process.env.NODE_ENV = 'production';

// Force commonjs require for the NestJS app
const AppModule = require('./dist/api/src/app.module.js');
const createFunction = require('./dist/api/src/serverless.js');

// Create a single serverless function that handles all routes
module.exports = createFunction.default(AppModule.AppModule);

