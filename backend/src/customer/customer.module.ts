import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [PrismaModule, AccountModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {} 