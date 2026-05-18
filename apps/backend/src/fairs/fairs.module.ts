import { Module } from '@nestjs/common';
import { FairsService } from './fairs.service';
import { FairsController } from './fairs.controller';

@Module({
  controllers: [FairsController],
  providers:   [FairsService],
  exports:     [FairsService],
})
export class FairsModule {}
