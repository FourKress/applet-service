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
import { UsersService } from '../users/users.service';
import { ToolsService } from '../common/utils/tools-service';
import { User } from '../users/schemas/user.schema';

import * as currency from 'currency.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');
import * as utils from './utils';

@Injectable()
export class OrderService {
  private nowDayEndTime = Moment().startOf('day').add(1, 'day').valueOf();
  private nowDayStartTime = Moment().startOf('day').valueOf();
  private nowMonthTime = Moment().startOf('month').valueOf();
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly spaceService: SpaceService,
    private readonly matchService: MatchService,
    private readonly userRMatchService: UserRMatchService,
    private readonly userService: UsersService,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find().exec();
  }

  async findActiveOrder(): Promise<Order[]> {
    return await this.orderModel.find().in('status', [0, 1, 5, 7]).exec();
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

    const countdown =
      utils.countdown(order.createdAt, `${match.runDate} ${match.startAt}`) -
      (Moment() - Moment(order.createdAt));

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
      monthlyCardStatus: stadium.monthlyCardStatus,
      countdown: countdown > 0 ? countdown : 0,
      statusName: utils.StatusMap[order.status],
      validPeriodStart: isMonthlyCard ? isMonthlyCard.validPeriodStart : '',
      validPeriodEnd: isMonthlyCard ? isMonthlyCard.validPeriodEnd : '',
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
    const match: any = await this.matchService.findById(matchId);

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

    const relation = {
      userId,
      spaceId,
      stadiumId,
      matchId,
      count: personCount,
    };
    await this.userRMatchService.addRelation(relation);
    match.selectPeople = match.selectPeople + personCount;
    await this.matchService.modifyMatchSelectPeople(match.toJSON());
    const newOrder = new this.orderModel({
      ...addOrder,
      userId,
      status: 0,
      user: userId,
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

  async orderPay(id: string, payMethod: string): Promise<boolean> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    const order = await this.orderModel.findById(id);
    if (!order) {
      ToolsService.fail('支付失败，未找到对应的订单！');
    }
    const { matchId, stadiumId, userId, isMonthlyCard, personCount } = order;

    const match = await this.matchService.findById(matchId);
    if (
      utils.countdown(order.createdAt, `${match.runDate} ${match.startAt}`) -
        (Moment() - Moment(order.createdAt)) <
      0
    ) {
      ToolsService.fail('支付失败，订单已超时！');
    }

    let amount = 0;
    const isWechat = payMethod === 'wechat';
    if (isWechat) {
      amount = personCount * match.rebatePrice;
    } else if (payMethod === 'monthlyCard') {
      const baseAmount = (personCount - 1) * match.rebatePrice;
      if (!isMonthlyCard) {
        await this.monthlyCardService.addMonthlyCard({
          userId,
          stadiumId,
          validPeriodStart: Moment().format('YYYY-MM-DD'),
          validPeriodEnd: Moment().add(31, 'day').format('YYYY-MM-DD'),
        });
        const stadium = await this.stadiumService.findById(stadiumId);
        if (!stadium.monthlyCardStatus) {
          ToolsService.fail('不支持月卡支付，请选择其他支付方式');
        }
        amount = stadium.monthlyCardPrice + baseAmount;
      } else {
        amount = baseAmount;
      }
    }

    await this.orderModel
      .findByIdAndUpdate(id, {
        status: 1,
        payAmount: amount,
        payAt: Moment.now(),
        payMethod: isWechat ? 1 : 2,
        newMonthlyCard: !isWechat && !isMonthlyCard,
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
        order.stadiumTempCount = orderList.length;
        order.orderStatus = utils.StatusMap[orderList[0].status];
        return order;
      }),
    );
    return userByStadiumList;
  }

  async findOrderByDate(
    type = 0,
    bossId: string,
    month: string,
  ): Promise<Order[]> {
    const baseSearch = this.orderModel
      .find({ bossId, status: 2 })
      .where('createdAt');
    let statisticsList = [];
    if (month) {
      type = 2;
    }
    switch (Number(type)) {
      case 0:
        statisticsList = await baseSearch
          .gte(this.nowDayStartTime)
          .lte(this.nowDayEndTime)
          .exec();
        break;
      case 1:
        statisticsList = await baseSearch
          .gte(this.nowMonthTime)
          .lte(this.nowDayEndTime)
          .exec();
        break;
      case 2:
        statisticsList = await baseSearch
          .gte(Moment(month).startOf('month').valueOf())
          .lte(Moment(month).add(1, 'month').startOf('month').valueOf())
          .exec();
        break;
      default:
        break;
    }
    return statisticsList;
  }

  async monthAndAayStatistics(bossId: string, month: string): Promise<any> {
    const statisticsList = await this.findOrderByDate(1, bossId, month);
    const balanceAmt = (await this.userService.findByBossId(bossId)).balanceAmt;
    const sum = {
      dayCount: 0,
      monthCount: 0,
      balanceAmt,
    };
    statisticsList.forEach((order) => {
      const { payAmount } = order;
      const price = Number(payAmount);
      sum.monthCount = currency(sum.monthCount).add(price).value;
      if (Moment(order.createdAt).diff(Moment(this.nowDayStartTime)) > 0) {
        sum.dayCount = currency(sum.dayCount).add(price).value;
      }
    });
    Object.keys(sum).forEach((d) => {
      sum[d] = parseFloat(sum[d]).toFixed(2);
    });
    return sum;
  }

  async findOrderByStadiumId(params: any): Promise<any> {
    const { stadiumId, runDate } = params;
    const stadium = await this.stadiumService.findById(stadiumId);
    const { name, id } = stadium;
    const matchList = (await this.matchService.findByStadiumId(params)).filter(
      (d) => Moment(Moment.now()).diff(Moment(`${d.runDate} ${d.endAt}`)) >= 0,
    );
    const matchCoverOrderList = await Promise.all(
      matchList.map(async (item: any) => {
        const match = item.toJSON();
        const { id } = match;
        const orderList = await this.orderModel
          .find({ matchId: id })
          .in('status', [2]);
        const monthlyCardCount = orderList.filter(
          (d) => d.payMethod === 2,
        ).length;
        const isOrdinary = (d) =>
          d.payMethod === 1 || (d.payMethod === 2 && d.personCount > 1);
        const filterList = orderList.filter((d) => isOrdinary(d));
        const ordinaryCount = filterList.reduce(
          (sum, curr) =>
            sum +
            (curr.payMethod === 1 ? curr.personCount : curr.personCount - 1),
          0,
        );
        const sumPayAmount = filterList.reduce(
          (sum, curr) => currency(sum).add(curr.payAmount).value,
          0,
        );
        return {
          ...match,
          sumPayAmount,
          monthlyCardCount,
          ordinaryCount,
        };
      }),
    );
    const stadiumSumAmount = matchCoverOrderList.reduce(
      (sum, curr) => currency(sum).add(curr.sumPayAmount).value,
      0,
    );
    return {
      matchCoverOrderList,
      stadiumName: name,
      stadiumId: id,
      stadiumSumAmount,
      runDate,
    };
  }

  async findOrderByMatchId(matchId: string): Promise<any> {
    const orderList = await this.orderModel
      .find({
        matchId,
      })
      .in('status', [2, 3, 6])
      .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
      .exec();
    const success = [];
    const cancel = [];
    const selfRefund = [];
    const systemRefund = [];
    let totalAmount = 0;

    await Promise.all(
      orderList.map(async (order: any) => {
        const {
          status,
          payMethod,
          newMonthlyCard,
          userId,
          stadiumId,
          refundType,
        } = order;
        if (status === 2) {
          if (payMethod && !newMonthlyCard) {
            order.monthlyCardValidDate = (
              await this.monthlyCardService.checkMonthlyCard({
                userId,
                stadiumId,
              })
            )?.validPeriodEnd;
          }
          totalAmount = currency(totalAmount).add(order.payAmount).value;
          success.push(order);
        } else if (status === 6) {
          cancel.push(order);
        } else if (status === 3) {
          if (refundType === 1) {
            systemRefund.push(order);
          } else {
            selfRefund.push(order);
          }
        }
      }),
    );

    return {
      success,
      cancel,
      selfRefund,
      systemRefund,
      totalAmount,
    };
  }

  async signUpTop(stadiumId): Promise<any> {
    const orderList: any[] = await this.orderModel
      .find({
        stadiumId,
        status: 2,
      })
      .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
      .exec();
    const userIds = [...new Set(orderList.map((d) => d.userId))];
    const coverList = [];
    userIds.forEach((userId) => {
      coverList.push(orderList.filter((d) => d.userId === userId));
    });
    coverList.sort((a, b) => a.length - b.length);
    const topList = coverList.map((d: any) => {
      return {
        ...d[0].toJSON(),
        count: d.length,
        totalPayAmount: d.reduce(
          (sum, curr) => currency(sum).add(curr.payAmount).value,
          0,
        ),
      };
    });
    if (topList.length > 10) {
      return topList.slice(0, 9);
    }
    return topList;
  }
}
