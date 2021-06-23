import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';
import { StadiumService } from '../stadium/stadium.service';
import { SpaceService } from '../space/space.service';
import { MatchService } from '../match/match.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly spaceService: SpaceService,
    private readonly matchService: MatchService,
  ) {}

  async findAll(): Promise<any> {
    const orders = await this.orderRepository.find();
    return orders;
  }

  async orderCount(userId: string): Promise<any> {
    const payCount = await this.orderRepository.find({
      status: 0,
      userId,
    });
    const startCount = await this.orderRepository.find({
      status: 1,
      userId,
    });
    const allCount = await this.orderRepository.find({ userId });
    return {
      payCount: payCount.length,
      startCount: startCount.length,
      allCount: allCount.length,
    };
  }

  async findOrderById(id: string): Promise<any> {
    if (!id) {
      return null;
    }
    const order: Order = await this.orderRepository.findOne(id);
    const { spaceId, matchId, stadiumId, payAmount, personCount, userId } =
      order;
    const stadium = await this.stadiumService.findById(stadiumId);
    const space = await this.spaceService.findById(spaceId);
    const match = await this.matchService.findById(matchId);
    const isMonthlyCard = await this.monthlyCardService.findByStadiumId(userId);
    const orderInfo = {
      ...order,
      stadiumName: stadium.name,
      spaceName: space.name,
      unit: space.unit,
      validateDate: space.validateDate.replace(/-/g, '.').substring(5, 10),
      runAt: match.runAt,
      duration: match.duration,
      price: match.price,
      isMonthlyCard: !!isMonthlyCard,
      monthlyCardPrice: stadium.monthlyCardPrice,
    };
    return {
      ...orderInfo,
    };
  }

  async findOrderByStatus(params: Order): Promise<any> {
    if (!params.userId) {
      return null;
    }
    const orders = await this.orderRepository.find({ ...params });
    return orders;
  }

  async addOrder(addOrder: Order): Promise<any> {
    const isMonthlyCard = await this.monthlyCardService.findByStadiumId(
      addOrder.userId,
    );
    const order = await this.orderRepository.save({
      ...addOrder,
      isMonthlyCard: !!isMonthlyCard,
    });

    return order.id;
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
