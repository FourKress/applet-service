import { Module } from '@nestjs/common';
import { MonthlyCardController } from './monthly-card.controller';
import { MonthlyCardService } from './monthly-card.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyCardSchema } from './schemas/monthlyCard.schema';
import { StadiumModule } from '../stadium/stadium.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MonthlyCard', schema: MonthlyCardSchema },
    ]),
    StadiumModule,
  ],
  controllers: [MonthlyCardController],
  providers: [MonthlyCardService],
  exports: [MonthlyCardService],
})
export class MonthlyCardModule {}
