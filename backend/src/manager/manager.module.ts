import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [PrismaModule, AccountModule],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule {} 