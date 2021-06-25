import { Module } from '@nestjs/common';
import { MonthlyCardController } from './monthly-card.controller';
import { MonthlyCardService } from './monthly-card.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyCard } from './monthly-card.entity';
import { StadiumModule } from '../stadium/stadium.module';

@Module({
  imports: [TypeOrmModule.forFeature([MonthlyCard]), StadiumModule],
  controllers: [MonthlyCardController],
  providers: [MonthlyCardService],
  exports: [MonthlyCardService],
})
export class MonthlyCardModule {}
