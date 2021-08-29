import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyCardModule } from '../monthly-card/monthly-card.module';
import { StadiumModule } from '../stadium/stadium.module';
import { SpaceModule } from '../space/space.module';
import { MatchModule } from '../match/match.module';
import { UserRMatchModule } from '../userRMatch/userRMatch.module';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MonthlyCardModule,
    StadiumModule,
    SpaceModule,
    MatchModule,
    UserRMatchModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
