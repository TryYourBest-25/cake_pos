import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [PrismaModule, AccountModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
