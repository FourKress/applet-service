import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

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
    const order = await this.orderRepository.save(addOrder);
    return order;
  }

  async modifyOrder(modifyOrder: Order): Promise<any> {
    const { id, ...info } = modifyOrder;
    const targetOrder = await this.orderRepository.findOne(id);
    const data = {
      ...targetOrder,
      ...info,
    };
    const order = await this.orderRepository.save(data);
    return order;
  }
}
