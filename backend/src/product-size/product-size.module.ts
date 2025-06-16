import { Module } from '@nestjs/common';
import { ProductSizeService } from './product-size.service';
import { ProductSizeController } from './product-size.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
  exports: [ProductSizeService],
})
export class ProductSizeModule {} 