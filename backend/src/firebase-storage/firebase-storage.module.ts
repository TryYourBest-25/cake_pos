import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseStorageService } from './firebase-storage.service';
import { FirebaseStorageController } from './firebase-storage.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FirebaseStorageController],
  providers: [FirebaseStorageService],
  exports: [FirebaseStorageService],
})
export class FirebaseStorageModule {} 