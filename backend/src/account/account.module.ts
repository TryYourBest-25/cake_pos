import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
// import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  // imports: [PrismaModule], // Add PrismaModule here once it's created and working
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService] // Export AccountService if other modules need to use it
})
export class AccountModule {} 