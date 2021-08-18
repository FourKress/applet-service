import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Revenue } from './revenue.entity';

import { OrderService } from '../order/order.service';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(Revenue)
    private readonly revenueRepository: Repository<Revenue>,
    private readonly orderService: OrderService,
  ) {}

  async getInfo(): Promise<any> {
    const list = await this.orderService.findOrderByDate();
    return list;
  }
}
