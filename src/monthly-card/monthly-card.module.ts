import { Module } from '@nestjs/common';
import { MonthlyCardController } from './monthly-card.controller';
import { MonthlyCardService } from './monthly-card.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyCard } from './monthly-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MonthlyCard])],
  controllers: [MonthlyCardController],
  providers: [MonthlyCardService],
  exports: [MonthlyCardService],
})
export class MonthlyCardModule {}
