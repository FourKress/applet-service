import { Module } from '@nestjs/common';
import { MonthlyCardController } from './monthly-card.controller';
import { MonthlyCardService } from './monthly-card.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyCard, MonthlyCardSchema } from './schemas/monthlyCard.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MonthlyCard.name, schema: MonthlyCardSchema },
    ]),
    UsersModule,
  ],
  controllers: [MonthlyCardController],
  providers: [MonthlyCardService],
  exports: [MonthlyCardService],
})
export class MonthlyCardModule {}
