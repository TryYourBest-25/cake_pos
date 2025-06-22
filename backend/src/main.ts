import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
      `${process.env.MANAGER_URL}`    ],
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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Cake POS API')
    .setDescription('API documentation for Cake POS System - Hệ thống quản lý cửa hàng bánh ngọt')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('auth', 'Authentication endpoints - Xác thực và ủy quyền')
    .addTag('accounts', 'Account management - Quản lý tài khoản')
    .addTag('customers', 'Customer management - Quản lý khách hàng')
    .addTag('employees', 'Employee management - Quản lý nhân viên')
    .addTag('categories', 'Category management - Quản lý danh mục sản phẩm')
    .addTag('products', 'Product management - Quản lý sản phẩm')
    .addTag('orders', 'Order management - Quản lý đơn hàng')
    .addTag('payments', 'Payment processing - Xử lý thanh toán')
    .addTag('invoices', 'Invoice management - Quản lý hóa đơn')
    .addTag('reports', 'Reports and analytics - Báo cáo và thống kê')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
