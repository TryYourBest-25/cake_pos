import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';
import { VersioningType, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    logger: ['error', 'warn', 'log'],
  });

  app.use(cookieParser());

  app.enableCors({
    origin: [
      `${process.env.VNP_IPN_URL}`,
      `${process.env.POS_URL}`,
      `${process.env.MANAGER_URL}`,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Cấu hình global validation pipe với transform
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
