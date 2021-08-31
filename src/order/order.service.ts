import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderInterface } from './interfaces/order.interface';
import { CreateOderDto } from './dto/create-oder.dto';
import { ModifyOderDto } from './dto/modify-oder.dto';
import { OrderInfoInterface } from './interfaces/order-info.interface';
import { OrderCountInterface } from './interfaces/order-count.interface';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';
import { StadiumService } from '../stadium/stadium.service';
import { SpaceService } from '../space/space.service';
import { MatchService } from '../match/match.service';
import { UserRMatchService } from '../userRMatch/userRMatch.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { UnitEnum } from '../common/enum/space.enum';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');
import * as utils from './utils';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly spaceService: SpaceService,
    private readonly matchService: MatchService,
    private readonly userRMatchService: UserRMatchService,
  ) {}

  async findAll(): Promise<Order[]> {
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
      ToolsService.fail('id不能为空！');
    }
    const order: any = await this.orderModel.findById(id);
    const { spaceId, matchId, stadiumId, personCount, userId } = order;
    const stadium = await this.stadiumService.findById(stadiumId);
    const space = await this.spaceService.findById(spaceId);
    const match = await this.matchService.findById(matchId);
    const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
      userId,
      stadiumId,
    });
    const price = match.price * (match.rebate / 10);
    let orderInfo = order.toJSON();
    orderInfo = Object.assign({}, orderInfo, {
      stadiumName: stadium.name,
      spaceName: space.name,
      unit: UnitEnum.find((d) => d.value === space.unit)?.label,
      runAt: `${match.startAt}-${match.endAt}`,
      runDate: match.runDate,
      duration: match.duration,
      price,
      totalPrice: price * personCount,
      isMonthlyCard: !!isMonthlyCard,
      monthlyCardPrice: stadium.monthlyCardPrice,
      countdown:
        utils.countdown(order.createdAt, `${match.runDate} ${match.startAt}`) -
        (Moment() - Moment(order.createdAt)),
      statusName: utils.StatusMap[order.status],
    });
    return orderInfo;
  }

  async findOrderByStatus(status: number, userId: string): Promise<Order[]> {
    if (!userId) {
      ToolsService.fail('userId不能为空！');
    }
    let search;
    if (typeof status === 'undefined') {
      search = {
        userId,
      };
    } else {
      search = {
        userId,
        status,
      };
    }
    const orders = (await this.orderModel.find(search).exec()).sort(
      (a: any, b: any) => b.createdAt - a.createdAt,
    );
    const coverOrders = await Promise.all(
      orders.map(async (order) => {
        const orderInfo = await this.findOrderById(order._id);
        return orderInfo;
      }),
    );
    return coverOrders;
  }

  async addOrder(addOrder: CreateOderDto, userId): Promise<string> {
    const { matchId, spaceId, stadiumId, personCount } = addOrder;
    const match = await this.matchService.findById(matchId);

    if (match.selectPeople + personCount > match.totalPeople) {
      ToolsService.fail('当前场次已没有位置可报名，请选择其它场次进行报名！');
    }
    if (Moment().diff(`${match.runDate} ${match.endAt}`) > 0) {
      ToolsService.fail('当前场次已结束，请选择其它场次进行报名。');
    }

    if (
      Moment().diff(`${match.runDate} ${match.startAt}`) > 0 &&
      match.selectPeople < match.minPeople
    ) {
      ToolsService.fail(
        '当前场次因未达最低人数组队不成功，请选择其它场次进行报名。',
      );
    }

    const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
      userId,
      stadiumId,
    });

    const relation = {
      userId,
      spaceId,
      stadiumId,
      matchId,
      count: personCount,
    };
    await this.userRMatchService.addRelation(relation);
    match.selectPeople = match.selectPeople + personCount;
    match.id = matchId;
    await this.matchService.modifyMatch(match);
    const newOrder = new this.orderModel({
      ...addOrder,
      userId,
      isMonthlyCard: !!isMonthlyCard,
      status: 0,
    });
    await newOrder.save();

    return newOrder._id;
  }

  async modifyOrder(modifyOrder: ModifyOderDto): Promise<Order> {
    const { id, ...order } = modifyOrder;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.orderModel.findByIdAndUpdate(id, order).exec();
  }

  async orderPay(id: string): Promise<boolean> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    const order = await this.orderModel.findById(id);
    if (!order) {
      ToolsService.fail('支付失败，未找到对应的订单！');
    }
    const { matchId, stadiumId, userId } = order;

    const match = await this.matchService.findById(matchId);
    if (
      utils.countdown(order.createdAt, `${match.runDate} ${match.startAt}`) -
        (Moment() - Moment(order.createdAt)) <
      0
    ) {
      ToolsService.fail('支付失败，订单已超时！');
    }

    await this.monthlyCardService.addMonthlyCard({
      userId,
      stadiumId,
      validPeriodStart: Moment().format('YYYY-MM-DD'),
      validPeriodEnd: Moment().add(31, 'day').format('YYYY-MM-DD'),
    });

    await this.orderModel
      .findByIdAndUpdate(id, {
        status: 1,
      })
      .exec();
    return true;
  }

  async findUserByStadiumOrder(params: any) {
    const { matchId, stadiumId } = params;
    const relationList = await this.userRMatchService.findAllByMatchId(matchId);
    const userByStadiumList = await Promise.all(
      relationList.map(async (item: any) => {
        const order = item.toJSON();
        const orderList = await this.orderModel.find({
          userId: order.id,
          matchId,
          stadiumId,
        });
        console.log(orderList.find((d) => d.matchId === matchId));
        order.stadiumTempCount = orderList.length;
        order.orderStatus = utils.StatusMap[orderList[0].status];
        return order;
      }),
    );
    return userByStadiumList;
  }

  async findOrderByDate(type = 0, bossId: string): Promise<Order[]> {
    let list = [];
    switch (Number(type)) {
      case 0:
        list = await this.orderModel.find({
          where: {
            createdAt: { $gte: Moment().startOf('day').toDate() },
          },
        });
        break;
      case 1:
        list = await this.orderModel
          .find({ bossId })
          .where('createdAt')
          .gte(Moment().startOf('month').valueOf())
          .lte(Moment().startOf('day').add(1, 'day').valueOf())
          .exec();
    }
    return list;
  }
}
