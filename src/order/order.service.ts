import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { Stadium } from '../stadium/stadium.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<any> {
    const orders = await this.orderRepository.find();
    return orders;
  }

  async findOrderById(userId: string): Promise<any> {
    if (!userId) {
      return null;
    }
    const orders = await this.orderRepository.find({ userId });
    return orders;
  }

  async addOrder(addOrder: Order): Promise<any> {
    const order = this.orderRepository.save(addOrder);
    return order;
  }
}
