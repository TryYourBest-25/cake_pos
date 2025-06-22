import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
// PrismaModule should be globally available if you followed the previous steps
// and set @Global() in PrismaModule definition.
// If not, you might need to import it here: import { PrismaModule } from '../prisma/prisma.module';

@Module({
  // imports: [PrismaModule], // Uncomment if PrismaModule is not global
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
