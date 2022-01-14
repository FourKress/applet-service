import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    return await this.orderModel.find().in('status', [0, 1, 7]).exec();
  }

  async findAwaitOrder(): Promise<Order[]> {
    return await this.orderModel.find().in('status', [4, 5]).exec();
  }

  async findCancelOrder(): Promise<Order[]> {
    return await this.orderModel
      .find({
        status: 6,
      })
      .exists('prepayInfo', true)
      .ne('closeFlag', true)
      .exec();
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

  async getOrderById(id: string): Promise<Order> {
    return this.orderModel.findById(id);
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
      expirationDate: `${match.runDate} ${match.startAt}`,
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

  async modifyOrder(modifyOrder: any): Promise<Order> {
    const { id, ...order } = modifyOrder;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.orderModel.findByIdAndUpdate(id, order).exec();
  }

  async orderPay(id: string, payMethod: string): Promise<Order> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    const order = await this.orderModel.findById(id);
    if (!order) {
      ToolsService.fail('不能支付，未找到对应的订单！');
    }
    const { matchId, stadiumId, userId, personCount } = order;

    const match = await this.matchService.findById(matchId);
    if (
      utils.countdown(order.createdAt, `${match.runDate} ${match.startAt}`) -
        (Moment() - Moment(order.createdAt)) <
      0
    ) {
      ToolsService.fail('支付失败，订单已超时！');
    }

    let amount = 0;
    let isMonthlyCard = false;
    const isWechat = payMethod === 'wechat';
    if (isWechat) {
      amount = personCount * match.rebatePrice;
    } else if (payMethod === 'monthlyCard') {
      const stadium = await this.stadiumService.findById(stadiumId);
      if (!stadium.monthlyCardStatus) {
        ToolsService.fail('不支持月卡支付，请选择其他支付方式');
      }
      const baseAmount = (personCount - 1) * match.rebatePrice;
      const checkMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
        userId,
        stadiumId,
      });
      isMonthlyCard = !!checkMonthlyCard;
      if (checkMonthlyCard) {
        amount = baseAmount;
      } else {
        await this.monthlyCardService.addMonthlyCard({
          userId,
          stadiumId,
          validPeriodStart: Moment().format('YYYY-MM-DD'),
          validPeriodEnd: Moment().add(31, 'day').format('YYYY-MM-DD'),
        });
        amount = stadium.monthlyCardPrice + baseAmount;
      }
    }

    return await this.orderModel
      .findByIdAndUpdate(id, {
        // TODO 临时设置
        // payAmount: amount,
        payAmount: 1,
        payMethod: isWechat ? 1 : 2,
        newMonthlyCard: !isWechat && !isMonthlyCard,
        isMonthlyCard,
      })
      .exec();
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
          (item) => item.payMethod === 2,
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

  relationByUserIdAndMatchId(userId: string, matchIds: string[]): any {
    if (!userId || !matchIds?.length) {
      ToolsService.fail(`${!userId ? 'userId' : 'matchIds'}不能为空！`);
    }
    const relationList = this.orderModel
      .find({
        userId,
      })
      .in('status', [0, 1, 7])
      .in('matchId', matchIds);
    return relationList;
  }

  async getRefundInfo(orderId, refundType): Promise<any> {
    const order = (await this.orderModel.findById(orderId)).toJSON();
    const { payAmount, matchId, payMethod, newMonthlyCard, status } = order;
    if (status !== 1) {
      ToolsService.fail('该订单无法退款，请检查订单状态！');
      return;
    }
    // TODO 月卡类型退款金额为0,可直接退款
    const matchDb: any = await this.matchService.findById(matchId);
    const { startAt, runDate } = matchDb.toJSON();
    const diffTime = Moment(`${runDate} ${startAt}`).diff(Moment(), 'minutes');
    let refundAmount = 0;
    if (diffTime < 60) {
      ToolsService.fail('距开场小于一小时，无法退款！');
      return;
    } else if (60 <= diffTime && diffTime < 120) {
      refundAmount = currency(payAmount).multiply(0.8).value;
    } else if (diffTime >= 120) {
      refundAmount = payAmount;
    }
    const refundId = order.refundId || Types.ObjectId().toHexString();
    await this.orderModel.findByIdAndUpdate(orderId, {
      // TODO 临时设置退款金额
      // refundAmount,
      refundAmount: 1,
      refundType,
      refundId,
    });
    return {
      refundAmount: currency(refundAmount, { precision: 2 }).value,
      refundType,
      refundId,
    };
  }

  async orderRefund(orderId) {
    const order: any = (await this.orderModel.findById(orderId)).toJSON();
    const { matchId, personCount } = order;
    const match: any = await this.matchService.findById(matchId);
    const realSelectPeople = match.selectPeople - personCount;
    await this.matchService.changeMatchSelectPeople({
      id: matchId,
      selectPeople: realSelectPeople,
    });
    await this.userRMatchService.changeRCount({
      matchId,
      count: realSelectPeople,
    });
    return await this.modifyOrder({
      ...order,
      status: 4,
    });
  }

  setUserInfo(order, orderList) {
    const filterList = orderList.filter(
      (f: any) => f.user.id === order.user.id,
    );
    return {
      ...order.user,
      count: filterList.length,
      monthlyCardCount: filterList.filter((d) => d.isMonthlyCard).length,
      lastTime: filterList[0].createdAt,
      stadiumId: order.stadiumId,
      totalPayAmount: filterList.reduce(
        (sum, curr) => currency(sum).add(curr.payAmount).value,
        0,
      ),
    };
  }

  async userList(bossId, type): Promise<any[]> {
    const orderList = (
      await this.orderModel
        .find({
          bossId,
          status: 2,
        })
        .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
        .exec()
    )
      .reverse()
      .map((d: any) => d.toJSON());

    const userList = [];

    orderList.forEach((order: any, index) => {
      if (index === 0) {
        userList.push(this.setUserInfo(order, orderList));
      } else {
        const ids = userList.map((u) => u.id);
        if (!ids.includes(order.user.id)) {
          userList.push(this.setUserInfo(order, orderList));
        }
      }
    });
    let flag = false;
    const coverUserList = await Promise.all(
      userList.map(async (user) => {
        const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard({
          userId: user.id,
          stadiumId: user.stadiumId,
        });
        if (!!isMonthlyCard) flag = true;
        return {
          ...user,
          isMonthlyCard: !!isMonthlyCard,
        };
      }),
    );
    const sortFn = {
      0: (a, b) => b.count - a.count,
      1: (a, b) => b.createdAt - a.createdAt,
      2: (a, b) => b.count - a.count,
    };
    if (flag) {
      sortFn[2] = (a, b) => b.isMonthlyCard - a.isMonthlyCard;
    }
    return coverUserList.sort(sortFn[type] || sortFn[0]);
  }
}
