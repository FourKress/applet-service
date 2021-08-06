import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';
import { StadiumService } from '../stadium/stadium.service';
import { SpaceService } from '../space/space.service';
import { MatchService } from '../match/match.service';
import { UserRMatchService } from '../user-r-match/user-r-match.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');
import * as utils from './utils';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly spaceService: SpaceService,
    private readonly matchService: MatchService,
    private readonly userRMatchService: UserRMatchService,
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
    const { spaceId, matchId, stadiumId, personCount, userId } = order;
    const stadium = await this.stadiumService.findById(stadiumId);
    const space = await this.spaceService.findById(spaceId);
    const match = await this.matchService.findById(matchId);
    const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
      userId,
      stadiumId,
    });
    const price = match.price * (match.rebate / 10);
    const orderInfo = {
      ...order,
      stadiumName: stadium.name,
      spaceName: space.name,
      unit: space.unit,
      validateDate: space.validateDate.replace(/-/g, '.').substring(5, 10),
      runAt: `${utils.getHour(match.startAt)}-${utils.getHour(match.endAt)}`,
      duration: match.duration,
      price,
      totalPrice: price * personCount,
      isMonthlyCard: !!isMonthlyCard,
      monthlyCardPrice: stadium.monthlyCardPrice,
      countdown:
        utils.countdown(order.createdAt, match.startAt) -
        (Moment() - Moment(order.createdAt)),
      statusName: utils.StatusMap[order.status],
    };
    return {
      ...orderInfo,
    };
  }

  async findOrderByStatus(params: Order): Promise<any> {
    if (!params.userId) {
      return null;
    }
    const orders = (await this.orderRepository.find({ ...params })).sort(
      (a: any, b: any) => b.createdAt - a.createdAt,
    );
    const coverOrders = await Promise.all(
      orders.map(async (order: Order) => {
        const orderInfo = await this.findOrderById(order.id);
        return orderInfo;
      }),
    );
    return coverOrders;
  }

  async addOrder(addOrder: Order): Promise<any> {
    const { matchId } = addOrder;
    const match = await this.matchService.findById(matchId);

    if (match.selectPeople + addOrder.personCount > match.totalPeople) {
      return {
        code: 11000,
        msg: '当前场次已没有位置可报名，请选择其它场次进行报名',
        data: null,
      };
    }
    if (Moment().diff(match.endAt) > 0) {
      return {
        code: 11000,
        msg: '当前场次已结束，请选择其它场次进行报名。',
        data: null,
      };
    }

    if (
      Moment().diff(match.startAt) > 0 &&
      match.selectPeople < match.minPeople
    ) {
      return {
        code: 11000,
        msg: '当前场次因未达最低人数组队不成功，请选择其它场次进行报名。',
        data: null,
      };
    }

    const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
      userId: addOrder.userId,
      stadiumId: addOrder.stadiumId,
    });

    const relation = {
      userId: addOrder.userId,
      spaceId: addOrder.spaceId,
      stadiumId: addOrder.stadiumId,
      matchId,
      count: addOrder.personCount,
    };
    await this.userRMatchService.addRelation(relation);

    await this.matchService.modifyMatch({
      ...match,
      selectPeople: match.selectPeople + addOrder.personCount,
    });

    const order = await this.orderRepository.save({
      ...addOrder,
      isMonthlyCard: !!isMonthlyCard,
      status: 0,
    });

    return {
      code: 10000,
      data: order.id,
      msg: '',
    };
  }

  async modifyOrder(modifyOrder: Order): Promise<any> {
    const { id, ...info } = modifyOrder;
    if (!id) {
      return null;
    }
    await this.orderRepository.update(id, info);
    const order = await this.orderRepository.findOne(id);
    return order;
  }

  async orderPay(payInfo: Order): Promise<any> {
    if (!payInfo.id) {
      return false;
    }
    const order = await this.orderRepository.findOne(payInfo.id);
    if (!order) {
      return false;
    }
    const match = await this.matchService.findById(order.matchId);
    if (
      utils.countdown(order.createdAt, match.startAt) -
        (Moment() - Moment(order.createdAt)) <
      0
    ) {
      return false;
    }

    await this.orderRepository.save({
      ...order,
      status: 1,
    });
    return true;
  }

  async findOrderByDate(type = 0): Promise<Order[]> {
    console.log(type);
    let list = [];
    switch (type) {
      case 0:
        list = await this.orderRepository.find({
          where: {
            createdAt: { $gte: Moment().startOf('day').toDate() },
          },
        });
        break;
      case 1:
        list = await this.orderRepository.find({
          where: {
            createdAt: {
              $lte: Moment().startOf('day').toDate(),
              $gte: Moment().startOf('month').toDate(),
            },
          },
        });
    }
    return list;
  }
}
