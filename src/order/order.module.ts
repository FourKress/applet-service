import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { MonthlyCardModule } from '../monthly-card/monthly-card.module';
import { StadiumModule } from '../stadium/stadium.module';
import { SpaceModule } from '../space/space.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    MonthlyCardModule,
    StadiumModule,
    SpaceModule,
    MatchModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
