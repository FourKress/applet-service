import { Module } from '@nestjs/common';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revenue } from './revenue.entity';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Revenue]), OrderModule],
  controllers: [RevenueController],
  providers: [RevenueService],
  exports: [RevenueService],
})
export class RevenueModule {}
