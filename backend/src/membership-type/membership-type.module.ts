import { Module } from '@nestjs/common';
import { MembershipTypeService } from './membership-type.service';
import { MembershipTypeController } from './membership-type.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipTypeController],
  providers: [MembershipTypeService],
  exports: [MembershipTypeService], // Export service nếu cần sử dụng ở module khác
})
export class MembershipTypeModule {}
