import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderInterface } from './interfaces/order.interface';
import { CreateOderDto } from './dto/create-oder.dto';
import { OrderInfoInterface } from './interfaces/order-info.interface';
import { OrderCountInterface } from './interfaces/order-count.interface';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';
import { StadiumService } from '../stadium/stadium.service';
import { SpaceService } from '../space/space.service';
import { MatchService } from '../match/match.service';
import { UserRMatchService } from '../userRMatch/userRMatch.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');
import * as utils from './utils';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<OrderInterface>,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly spaceService: SpaceService,
    private readonly matchService: MatchService,
    private readonly userRMatchService: UserRMatchService,
  ) {}

  async findAll(): Promise<OrderInterface[]> {
    return await this.orderModel.find().exec();
  }

  async orderCount(userId: string): Promise<OrderCountInterface> {
    const payCount = await this.orderModel
      .find({
        status: 0,
        userId,
      })
      .exec();
    const startCount = await this.orderModel
      .find({
        status: 1,
        userId,
      })
      .exec();
    const allCount = await this.orderModel.find({ userId }).exec();
    return {
      payCount: payCount.length,
      startCount: startCount.length,
      allCount: allCount.length,
    };
  }

  async findOrderById(id: string): Promise<OrderInfoInterface> {
    if (!id) {
      return null;
    }
    const order = await this.orderModel.findById(id);
    const { spaceId, matchId, stadiumId, personCount, userId } = order;
    const stadium = await this.stadiumService.findById(stadiumId);
    const space = await this.spaceService.findById(spaceId);
    const match = await this.matchService.findById(matchId);
    const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
      userId,
      stadiumId,
    });
    const price = match.price * (match.rebate / 10);
    const orderInfo = Object.assign({}, order, {
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
    });
    return orderInfo;
  }

  async findOrderByStatus(status, userId): Promise<OrderInterface[]> {
    if (!userId) {
      return null;
    }
    const orders = (
      await this.orderModel
        .find({
          status,
          userId,
        })
        .exec()
    ).sort((a: any, b: any) => b.createdAt - a.createdAt);
    const coverOrders = await Promise.all(
      orders.map(async (order: OrderInterface) => {
        const orderInfo = await this.findOrderById(order.id);
        return orderInfo;
      }),
    );
    return coverOrders;
  }

  async addOrder(addOrder: CreateOderDto): Promise<any> {
    const { matchId } = addOrder;
    const match = await this.matchService.findById(matchId);

    if (match.selectPeople + addOrder.personCount > match.totalPeople) {
      return {
        msg: '当前场次已没有位置可报名，请选择其它场次进行报名',
      };
    }
    if (Moment().diff(match.endAt) > 0) {
      return {
        msg: '当前场次已结束，请选择其它场次进行报名。',
      };
    }

    if (
      Moment().diff(match.startAt) > 0 &&
      match.selectPeople < match.minPeople
    ) {
      return {
        msg: '当前场次因未达最低人数组队不成功，请选择其它场次进行报名。',
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

    await this.matchService.modifyMatch(
      Object.assign({}, match, {
        selectPeople: match.selectPeople + addOrder.personCount,
      }),
    );
    const newOrder = new this.orderModel({
      ...addOrder,
      isMonthlyCard: !!isMonthlyCard,
      status: 0,
    });
    await newOrder.save();

    return {
      orderId: newOrder.id,
    };
  }

  async modifyOrder(modifyOrder: OrderInterface): Promise<OrderInterface> {
    const { id, ...order } = modifyOrder;
    if (!id) {
      return null;
    }
    return await this.orderModel.findByIdAndUpdate(id, order).exec();
  }

  async orderPay(payInfo: OrderInterface): Promise<any> {
    const { id } = payInfo;
    if (!id) {
      return false;
    }
    const order = await this.orderModel.findById(id);
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
    await this.orderModel
      .findByIdAndUpdate(id, {
        payInfo,
        status: 1,
      })
      .exec();
    return true;
  }

  async findOrderByDate(type = 0): Promise<OrderInterface[]> {
    console.log(type);
    let list = [];
    switch (type) {
      case 0:
        list = await this.orderModel.find({
          where: {
            createdAt: { $gte: Moment().startOf('day').toDate() },
          },
        });
        break;
      case 1:
        list = await this.orderModel.find({
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
