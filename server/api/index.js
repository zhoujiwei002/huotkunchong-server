// Vercel serverless function handler
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('./dist/app.module');
const { HttpStatusInterceptor } = require('./dist/interceptors/http-status.interceptor');

let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.setGlobalPrefix('api');
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalInterceptors(new HttpStatusInterceptor());

    cachedServer = expressApp;
  }

  return cachedServer;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
