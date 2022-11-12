import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOderDto } from './dto/create-oder.dto';
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
import { WxService } from '../wx/wx.service';
import { RefundRuleService } from '../refundRule/refundRule.service';

import * as currency from 'currency.js';
const Moment = require('moment');
import * as utils from './utils';
import { Space } from '../space/schemas/space.schema';
import { Stadium } from '../stadium/schemas/stadium.schema';
import { Match } from '../match/schemas/match.schema';

@Injectable()
export class OrderService {
  private nowDayEndTime = () => Moment().startOf('day').add(1, 'day').valueOf();
  private nowDayStartTime = () => Moment().startOf('day').valueOf();
  private nowMonthTime = () => Moment().startOf('month').valueOf();
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly spaceService: SpaceService,
    private readonly matchService: MatchService,
    private readonly userRMatchService: UserRMatchService,
    private readonly userService: UsersService,
    private readonly wxService: WxService,
    private readonly refundRuleService: RefundRuleService,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderModel
      .find()
      .sort({ createdAt: 'desc' })
      .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
      .populate('stadiumId', { name: 1, monthlyCardPrice: 1 }, Stadium.name)
      .populate('spaceId', { name: 1, unit: 1 }, Space.name)
      .populate(
        'matchId',
        {
          name: 1,
          runDate: 1,
          startAt: 1,
          endAt: 1,
          rebate: 1,
          rebatePrice: 1,
          price: 1,
          repeatName: 1,
          repeatWeek: 1,
        },
        Match.name,
      )
      .exec();
  }

  async findActiveOrder(): Promise<Order[]> {
    return await this.orderModel.find().in('status', [0, 1, 7]).exec();
  }

  async findAwaitOrder(): Promise<Order[]> {
    return await this.orderModel.find().in('status', [4, 5]).exec();
  }

  async findCancelOrder(): Promise<Order[]> {
    return await this.orderModel
      .find()
      .in('status', [6, 8])
      .exists('prepayInfo', true)
      .ne('closeFlag', true)
      .ne('payAmount', 0)
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
    return this.orderModel
      .findById(id)
      .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
      .populate('stadiumId', { name: 1, _id: 1, wxGroupId: 1 }, Stadium.name)
      .populate('spaceId', { name: 1, _id: 1, unit: 1 }, Space.name)
      .populate(
        'matchId',
        {
          _id: 1,
          runDate: 1,
          startAt: 1,
          endAt: 1,
          selectPeople: 1,
          minPeople: 1,
          totalPeople: 1,
        },
        Match.name,
      );
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
    const isMonthlyCard =
      match.type === 0
        ? await this.monthlyCardService.checkMonthlyCard(
            {
              userId,
              stadiumId,
              validFlag: true,
            },
            match.runDate,
          )
        : false;
    const findMonthlyCard =
      match.type === 0
        ? await this.orderModel
            .find({
              matchId,
              userId,
              payMethod: 2,
            })
            .in('status', [1, 2, 5, 7])
        : [];

    const price = currency(match.price).multiply(match.rebate / 10).value;

    const packageInfo = match.type === 1 ? order?.packageInfo[0] : {};
    const endAt = match.type === 1 ? packageInfo.endAt : match.endAt;
    const startAt = match.type === 1 ? packageInfo.startAt : match.startAt;

    const countdown =
      utils.countdown(order.createdAt, `${match.runDate} ${startAt}`) -
      (Moment() - Moment(order.createdAt));

    let orderInfo = order.toJSON();
    orderInfo = Object.assign({}, orderInfo, {
      stadiumName: stadium.name,
      spaceName: space.name,
      unit: UnitEnum.find((d) => d.value === space.unit)?.label,
      runAt: `${startAt}-${endAt}`,
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
      monthlyCardPayStatus: isMonthlyCard
        ? findMonthlyCard?.length === 0
        : true,
      chargeModel: match.chargeModel,

      matchType: match.type,
      interval: match.interval,
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

    let count = personCount;
    let packageInfo: any = '';
    let packageId = '';
    let endAt = match.endAt;
    let startAt = match.startAt;

    if (match.type === 1) {
      count = personCount?.length;
      packageInfo = personCount;
      packageId = Types.ObjectId().toHexString();
      endAt = packageInfo[0].endAt;
      startAt = packageInfo[0].startAt;
    }

    if (match.selectPeople + count > match.totalPeople) {
      ToolsService.fail(
        `${
          match.type === 1
            ? '当前已没有包场时段可选，请选择其它包场！'
            : '当前场次已没有位置可报名，请选择其它场次进行报名！'
        }`,
      );
    }
    if (Moment().diff(`${match.runDate} ${endAt}`) > 0) {
      ToolsService.fail(
        `${
          match.type === 1
            ? '当前已没有包场时段已结束，请选择其它包场！'
            : '当前场次已结束，请选择其它场次进行报名。'
        }`,
      );
    }

    if (
      match.type === 0 &&
      Moment().diff(`${match.runDate} ${startAt}`) > 0 &&
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
      count,
      expirationDate: `${match.runDate} ${startAt}`,
      packageInfo,
      packageId,
    };
    await this.userRMatchService.addRelation(relation);
    match.selectPeople = match.selectPeople + count;
    await this.matchService.modifyMatchSelectPeople(match.toJSON());
    const bossFromDB: any = await this.userService.findByBossId(
      addOrder.bossId,
    );
    const bossInfo = bossFromDB.toJSON();
    const newOrder = new this.orderModel({
      ...addOrder,
      personCount: count,
      packageInfo,
      packageId,
      userId,
      status: 0,
      user: userId,
      bossInfo: {
        ...bossInfo,
      },
    });
    await newOrder.save();

    return newOrder._id;
  }

  async modifyOrder(modifyOrder: any): Promise<Order> {
    const { id, ...order } = modifyOrder;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    if (order?.status === 0) {
      const orderFromDB = await this.orderModel.findById(id).exec();
      if (orderFromDB.status !== 5) {
        return orderFromDB;
      }
    }

    return await this.orderModel.findByIdAndUpdate(id, order).exec();
  }

  async checkOrderPayFlag(id) {
    let flag = true;
    if (!id) {
      flag = false;
      ToolsService.fail('id不能为空！');
    }
    const order = await this.orderModel.findById(id);
    if (!order) {
      flag = false;
      ToolsService.fail('不能支付，未找到对应的订单！');
    }
    const { matchId } = order;

    const match = await this.matchService.findById(matchId);
    if (!match?.status) {
      ToolsService.fail('不能支付，场次已取消！');
    }
    if (
      utils.countdown(order.createdAt, `${match.runDate} ${match.startAt}`) -
        (Moment() - Moment(order.createdAt)) <
      0
    ) {
      flag = false;
      ToolsService.fail('支付失败，订单已超时！');
    }

    return {
      flag,
      match: flag ? match : '',
      order: flag ? order : '',
    };
  }

  async getOrderCountdown(orderId) {
    const order = await this.orderModel.findById(orderId);
    const { matchId, createdAt } = order;
    const match = await this.matchService.findById(matchId);
    const timer =
      utils.countdown(
        createdAt,
        `${match.runDate} ${match.startAt}`,
        'seconds',
      ) - Moment().diff(Moment(createdAt), 'second');
    if (timer <= 0) {
      ToolsService.fail('支付失败，订单已超时！');
      return 0;
    }
    return timer;
  }

  async orderPay(id: string, payMethod: string): Promise<Order> {
    if (!payMethod) {
      ToolsService.fail('系统异常，支付失败');
    }
    const { flag, match, order }: any = await this.checkOrderPayFlag(id);
    if (!flag) return;

    const { stadiumId, userId, personCount } = order;

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
      const checkMonthlyCard = await this.monthlyCardService.checkMonthlyCard(
        {
          userId,
          stadiumId,
          validFlag: true,
        },
        match.runDate,
      );
      isMonthlyCard = !!checkMonthlyCard;
      if (isMonthlyCard) {
        amount = baseAmount;
      } else {
        amount = stadium.monthlyCardPrice + baseAmount;
      }
    }

    return await this.orderModel
      .findByIdAndUpdate(id, {
        // TODO 设置支付金额
        payAmount: currency(amount).value,
        // payAmount: 10,
        payMethod: isWechat ? 1 : 2,
        newMonthlyCard: !isWechat && !isMonthlyCard,
        isMonthlyCard,
      })
      .exec();
  }

  async findUserByStadiumOrder(params: any) {
    const { matchId, stadiumId } = params;
    const relationList = await this.userRMatchService.findAllByMatchId(matchId);
    const orderListFromDB = await this.orderModel
      .find({
        stadiumId,
      })
      .in(
        'userId',
        relationList.map((d) => d.id),
      )
      .nin('status', [3, 6, 8, 9])
      .exec();
    const orderList = orderListFromDB.map((d: any) => d.toJSON());
    const userByStadiumList = await Promise.all(
      relationList.map(async (user: any) => {
        const order = orderList.find((d: any) => d.id == user.orderId);
        user.stadiumTempCount = this.getCurrentMonthOrder(
          orderList,
          user.id,
        ).length;
        user.orderStatus = utils.StatusMap[order?.status];
        user.packageRefund = order.packageRefund;
        user.status = order.status;
        return user;
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
      .find({ bossId })
      .in('status', [2, 3])
      .where('createdAt');
    let statisticsList = [];
    if (month) {
      type = 2;
    }
    switch (Number(type)) {
      case 0:
        statisticsList = await baseSearch
          .gte(this.nowDayStartTime())
          .lte(this.nowDayEndTime())
          .exec();
        break;
      case 1:
        statisticsList = await baseSearch
          .gte(this.nowMonthTime())
          .lte(this.nowDayEndTime())
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
      const {
        payAmount,
        refundAmount = 0,
        compensateAmt = 0,
        wxRefundId = null,
      } = order;
      const price = Number(
        payAmount - (wxRefundId ? refundAmount : 0) - compensateAmt,
      );
      sum.monthCount = currency(sum.monthCount).add(price).value;
      if (Moment(order.createdAt).diff(Moment(this.nowDayStartTime())) > 0) {
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
    const matchList = (
      await this.matchService.findByStadiumId({ ...params, repeatFlag: false })
    )
      .filter(
        (d) =>
          Moment(Moment.now()).diff(Moment(`${d.runDate} ${d.startAt}`)) >= 0,
      )
      .map((d: any) => d.toJSON());

    const baseList = matchList.filter(
      (d) =>
        Moment(Moment.now()).diff(Moment(`${d.runDate} ${d.endAt}`)) >= 0 &&
        d.type === 0,
    );
    const packageList = matchList.filter((d) => d.type === 1);

    let packageMatchCoverOrderList = [];
    if (packageList?.length) {
      const basePackage = packageList[0];
      const packageOrderList = await this.orderModel
        .find({ matchId: basePackage.id })
        .in('status', [2]);

      if (packageOrderList.length) {
        packageOrderList.forEach((o, index) => {
          if (index === 0) {
            packageList[0].orderId = o._id;
          } else {
            packageList.push({
              ...basePackage,
              orderId: o._id,
            });
          }
        });

        packageMatchCoverOrderList = await Promise.all(
          packageList.map(async (match: any) => {
            const { orderId } = match;
            const order = packageOrderList.find((o) => o._id === orderId);
            const packageInfo = order.packageInfo[0] || {};
            const { startAt, endAt } = packageInfo;
            return {
              ...match,
              startAt,
              endAt,
              sumPayAmount: match.rebatePrice,
              monthlyCardCount: 0,
              ordinaryCount: 1,
              refundAmt: 0,
            };
          }),
        );
      }
    }

    let baseMatchCoverOrderList = [];
    if (baseList?.length) {
      baseMatchCoverOrderList = await Promise.all(
        baseList.map(async (match) => {
          const { id } = match;
          const orderList = await this.orderModel
            .find({ matchId: id })
            .in('status', [2, 3]);

          const monthlyCardCount = orderList.filter((item) => {
            if (item.payMethod === 2) {
              if (item.status === 2) {
                return true;
              } else if (item.payAmount > 0) {
                return true;
              }
              return false;
            }
            return false;
          }).length;
          let refundAmt = 0;
          const ordinaryCount = orderList.reduce((sum, curr) => {
            refundAmt = currency(refundAmt).add(
              (curr.wxRefundId &&
              curr.status === 3 &&
              curr.refundAmount !== curr.payAmount
                ? curr.payAmount - curr.refundAmount
                : 0) + (curr.compensateAmt || 0),
            ).value;
            if (curr.status === 2) {
              if (curr.payMethod === 1) {
                return sum + curr.personCount;
              } else {
                return sum + curr.personCount - 1;
              }
            } else {
              return sum + 0;
            }
          }, 0);
          const sumPayAmount = orderList.reduce(
            (sum, curr) =>
              currency(sum).add(
                curr.payAmount -
                  (curr.wxRefundId ? curr.refundAmount : 0) -
                  (curr.compensateAmt || 0),
              ).value,
            0,
          );
          return {
            ...match,
            sumPayAmount,
            monthlyCardCount,
            ordinaryCount,
            refundAmt,
          };
        }),
      );
    }

    const matchCoverOrderList = packageMatchCoverOrderList.concat(
      baseMatchCoverOrderList,
    );
    const stadiumSumAmount = matchCoverOrderList.reduce(
      (sum, curr) => currency(sum).add(curr?.sumPayAmount || 0).value,
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
      .populate('matchId', { price: 1, rebatePrice: 1 }, Match.name)
      .exec();
    const success = [];
    const cancel = [];
    const selfRefund = [];
    const systemRefund = [];
    let totalAmount = 0;

    await Promise.all(
      orderList.map(async (item: any) => {
        const order = item.toJSON();
        const {
          status,
          payMethod,
          newMonthlyCard,
          userId,
          stadiumId,
          refundType,
          matchId,
        } = order;
        if (status === 2) {
          if (payMethod === 2 && !newMonthlyCard) {
            const target = await this.monthlyCardService.checkMonthlyCard(
              {
                userId,
                stadiumId,
              },
              matchId.runDate,
            );
            order.monthlyCardValidDate = target?.validPeriodEnd;
          }
          totalAmount = currency(totalAmount).add(
            order.payAmount - (order.compensateAmt || 0),
          ).value;
          success.push(order);
        } else if (status === 6) {
          cancel.push(order);
        } else if (status === 3) {
          if (refundType === 1) {
            systemRefund.push(order);
          } else {
            totalAmount = currency(totalAmount).add(
              order.payAmount - (order.refundAmount || 0),
            ).value;
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

    const checkStatus = [0, 1, 9];
    if (refundType === 1) checkStatus.push(7);
    if (!checkStatus.includes(status)) {
      ToolsService.fail('该订单无法退款，请检查订单状态！');
      return;
    }

    const matchDb: any = await this.matchService.findById(matchId);
    const stadium = await this.stadiumService.findById(order.stadiumId);
    const { startAt, runDate } = matchDb.toJSON();
    const diffTime = Moment(`${runDate} ${startAt}`).diff(Moment(), 'seconds');
    let refundAmount = 0;

    if (refundType === 1) {
      refundAmount = payAmount;
      if (newMonthlyCard) {
        const cardPrice = stadium.monthlyCardPrice;
        refundAmount = currency(payAmount).subtract(cardPrice).value;
      }
    } else {
      if ((payMethod === 2 && payAmount === 0) || status === 6) {
        refundAmount = 0;
      } else {
        if (diffTime <= 2 * 60) {
          ToolsService.fail('距开场小于两分钟，无法退款！');
          return;
        } else {
          const rulesFromDB = await this.refundRuleService.checkByStadium(
            order.stadiumId,
          );
          if (!rulesFromDB || !rulesFromDB?.rules?.length) {
            refundAmount = 0;
          } else {
            const rules = rulesFromDB.rules.sort(
              (a, b) => a.refundTime - b.refundTime,
            );
            for (let i = rules.length - 1; i >= 0; i--) {
              const { refundRatio, refundTime } = rules[i];
              if (
                (i === 0 && diffTime < refundTime * 60 * 60) ||
                (diffTime < refundTime * 60 * 60 &&
                  diffTime >= rules[i - 1].refundTime * 60 * 60)
              ) {
                refundAmount = this.getRefundAmount(
                  newMonthlyCard,
                  payAmount,
                  stadium.monthlyCardPrice,
                  refundRatio,
                );
                break;
              } else if (
                i === rules.length - 1 &&
                diffTime >= refundTime * 60 * 60
              ) {
                refundAmount = payAmount;
                if (newMonthlyCard) {
                  refundAmount = currency(payAmount).subtract(
                    stadium.monthlyCardPrice,
                  ).value;
                }
                break;
              }
            }
          }
        }
      }
    }

    const refundId = order.refundId || Types.ObjectId().toHexString();
    await this.orderModel.findByIdAndUpdate(orderId, {
      refundAmount,
      refundType,
      refundId,
    });
    return {
      refundAmount: currency(refundAmount, { precision: 2 }).value,
      refundType,
      refundId,
      payAmount,
    };
  }

  getRefundAmount(newMonthlyCard, payAmount, monthlyCardPrice, refundRatio) {
    let refundAmount = 0;
    if (newMonthlyCard) {
      refundAmount = currency(payAmount - monthlyCardPrice).multiply(
        refundRatio,
      ).value;
    } else {
      refundAmount = currency(payAmount).multiply(refundRatio).value;
    }
    return refundAmount;
  }

  async handleSystemRefund(orderId) {
    return await this.getRefundInfo(orderId, 1);
  }

  async orderRefund({ orderId, status, refundType = 2 }) {
    const order = await this.orderModel.findById(orderId);
    if (refundType === 2 || order.packageId) {
      await this.handleMatchRestore(orderId);
    }
    return await this.modifyOrder({
      id: orderId,
      status,
    });
  }

  async applePackageRefund({ orderId }) {
    const order = (await this.orderModel.findById(orderId)).toJSON();
    const { status, matchId, packageRefund } = order;

    if (packageRefund) {
      ToolsService.fail('该订单已申请退款，请耐心等待审核！');
      return;
    }

    const checkStatus = [0, 1, 9];
    if (!checkStatus.includes(status)) {
      ToolsService.fail('该订单无法退款，请检查订单状态！');
      return;
    }

    const matchDb: any = await this.matchService.findById(matchId);
    const { runDate } = matchDb.toJSON();

    const packageInfo = order.packageInfo[0];
    const { startAt } = packageInfo;
    const diffTime = Moment(`${runDate} ${startAt}`).diff(Moment(), 'seconds');
    if (diffTime <= 2 * 60) {
      ToolsService.fail('距开场小于两分钟，无法申请退款！');
    }

    return await this.modifyOrder({
      id: orderId,
      packageRefund: true,
    });
  }

  async getPackageRefund({ stadiumId }) {
    const list = await this.orderModel
      .find({
        stadiumId,
        packageRefund: true,
        wxRefundId: null,
        refundId: null,
      })
      .populate('matchId', { runDate: 1 }, Match.name)
      .populate('spaceId', { name: 1, unit: 1 }, Space.name)
      .populate('user', { nickName: 1, avatarUrl: 1, phoneNum: 1 }, User.name)
      .exec();

    const packageRefundList = [];
    list.forEach((d: any) => {
      const order = d.toJSON();
      const packageInfo = d.packageInfo[0] || {};
      const runDate = d.matchId.runDate;
      const { startAt, endAt } = packageInfo;

      const diffTime = Moment(`${runDate} ${startAt}`).diff(
        Moment(),
        'seconds',
      );
      if (diffTime <= 2 * 60) {
        return;
      }

      packageRefundList.push({
        ...order,
        endAt,
        startAt,
        space: d.spaceId,
      });
    });

    return packageRefundList;
  }

  async launchPackageRefund(orderId) {
    const order = (await this.orderModel.findById(orderId)).toJSON();
    const refundId = order.refundId || Types.ObjectId().toHexString();
    const refundType = 1;
    const refundAmount = order.payAmount;
    await this.orderModel.findByIdAndUpdate(orderId, {
      refundAmount,
      refundType,
      refundId,
    });

    const refundInfo = {
      refundAmount: currency(refundAmount, { precision: 2 }).value,
      refundType,
      refundId,
      payAmount: order.payAmount,
    };

    await this.wxService.refund({
      orderId,
      ...refundInfo,
    });
  }

  async handleMatchRestore(orderId) {
    const order: any = (await this.orderModel.findById(orderId)).toJSON();
    const { matchId, personCount, userId, refundAmount, payAmount } = order;
    const userInfo = await this.userService.findByBossId(order?.bossId);
    if (order.wxOrderId && payAmount > 0 && refundAmount === 0) {
      const addBalanceAmt = payAmount - 0;
      const balanceAmt = userInfo.balanceAmt + addBalanceAmt;
      await this.userService.setBossBalanceAmt({
        bossId: order?.bossId,
        balanceAmt,
        withdrawAt: Moment.now(),
      });
    }

    const match: any = await this.matchService.findById(matchId);
    const userRMatch = await this.userRMatchService.onlyRelationByUserId(
      matchId,
      userId,
      order.packageId,
    );
    const realSelectPeople = match.selectPeople - personCount;
    const selectPeople = realSelectPeople < 0 ? 0 : realSelectPeople;

    await this.matchService.changeMatchSelectPeople({
      id: matchId,
      selectPeople,
    });
    await this.userRMatchService.changeRCount({
      matchId,
      userId,
      count: userRMatch.count - personCount,
      packageId: order.packageId,
    });
  }

  setUserInfo(order, orderList) {
    const filterList = orderList.filter(
      (f: any) => f.user.id === order.user.id,
    );
    return {
      ...order.user,
      orderRunDate: order?.matchId.runDate,
      count: filterList.length,
      monthlyCardCount: filterList.filter((d) => d.isMonthlyCard).length,
      lastTime: filterList[0].createdAt,
      stadiumId: order.stadiumId,
      totalPayAmount: filterList.reduce(
        (sum, curr) =>
          currency(sum).add(curr.payAmount - (curr.compensateAmt || 0)).value,
        0,
      ),
    };
  }

  async userList(bossId, params): Promise<any[]> {
    const { type = 0, keywords = undefined } = params;
    const orderList = (
      await this.orderModel
        .find({
          bossId,
          status: 2,
          packageId: '',
        })
        .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
        .populate('matchId', { runDate: 1 }, Match.name)
        .exec()
    )
      .reverse()
      .map((d: any) => d.toJSON());

    const userList = [];

    orderList
      .filter((d) => (keywords ? d.user?.nickName.includes(keywords) : true))
      .forEach((order: any, index) => {
        if (index === 0) {
          userList.push(this.setUserInfo(order, orderList));
        } else {
          const ids = userList.map((u) => u.id);
          if (!ids.includes(order.user.id)) {
            userList.push(this.setUserInfo(order, orderList));
          }
        }
      });
    const coverUserList = await Promise.all(
      userList.map(async (user) => {
        const isMonthlyCard = await this.monthlyCardService.checkMonthlyCard(
          {
            userId: user.id,
            stadiumId: user.stadiumId,
          },
          user.orderRunDate,
        );
        return {
          ...user,
          isMonthlyCard: !!isMonthlyCard,
        };
      }),
    );
    const sortFn = {
      0: (a, b) => b.count - a.count,
      1: (a, b) => b.lastTime - a.lastTime,
    };
    return coverUserList.sort(sortFn[type] || sortFn[0]);
  }

  async handleOrderByMatchCancel(matchId: string): Promise<any> {
    // 5,
    const orderList = await this.orderModel
      .find({ matchId })
      .in('status', [0, 1, 7])
      .exec();

    if (!orderList?.length) return true;

    await Promise.all(
      orderList.map(async (order) => {
        const { status, id } = order.toJSON();
        if (status === 0) {
          console.log('取消');
          await this.modifyOrder({ id, status: 6 });
        } else {
          console.log('退款');
          const refundInfo: any = await this.handleSystemRefund(id);
          if (refundInfo.refundAmount === 0) {
            await this.modifyOrder({
              id,
              status: 3,
            });
          } else {
            await this.wxService.refund({
              orderId: id,
              ...refundInfo,
            });
          }
        }
      }),
    );
    return true;
  }

  async findActiveOrderByMatchId(matchId: string): Promise<Order[]> {
    return await this.orderModel
      .find({ matchId })
      // .nin('status', [2, 3, 6])
      .exec();
  }

  async addMonthlyCard(userId, stadiumId, orderRunDate) {
    const check = await this.monthlyCardService.checkMonthlyCard(
      {
        userId,
        stadiumId,
        validFlag: true,
      },
      orderRunDate,
    );
    let validPeriodStart = Moment().format('YYYY-MM-DD');
    let validPeriodEnd = Moment().add(31, 'day').format('YYYY-MM-DD');
    // 已有月卡, 在当前月卡有效期外再次购买的情况
    if (check && orderRunDate) {
      validPeriodStart = orderRunDate;
      validPeriodEnd = Moment(orderRunDate).add(31, 'day').format('YYYY-MM-DD');
    }

    await this.monthlyCardService.addMonthlyCard({
      userId,
      stadiumId,
      validPeriodStart,
      validPeriodEnd,
      validFlag: true,
    });
    const user = await this.userService.findOneById(userId);
    await this.userService.modify({
      id: userId,
      monthlyCardCount: user.monthlyCardCount + 1,
    });
  }

  async infoByUserId(userId, bossId): Promise<any> {
    const list = await this.orderModel
      .find({
        userId,
        bossId,
        packageId: '',
      })
      .in('status', [2, 3])
      .populate(
        'matchId',
        { name: 1, unit: 1, runDate: 1, endAt: 1, startAt: 1 },
        Match.name,
      )
      .sort({ createdAt: 'desc' })
      .exec();
    const successCount = [];
    const errorCount = [];
    list.forEach((d) => {
      const { status } = d;
      if (status === 2) {
        successCount.push(d);
      } else {
        errorCount.push(d);
      }
    });

    return {
      success: successCount,
      error: errorCount,
      all: list,
      time: list[0].createdAt,
    };
  }

  async findActiveOrderByStadium(stadiumId): Promise<Order[]> {
    return await this.orderModel
      .find({
        stadiumId,
      })
      .in('status', [0, 5, 1, 7, 4, 9])
      .exec();
  }

  async findOrderByMatchIds(matchIds): Promise<Order[]> {
    return await this.orderModel
      .find()
      .in('matchId', matchIds)
      .in('status', [0, 5, 1, 7, 4, 9])
      .exec();
  }

  async findRegistrationFormOrder(
    userId,
    matchId,
    packageId,
  ): Promise<Order[]> {
    return await this.orderModel
      .find({
        userId,
        matchId,
        packageId,
      })
      .nin('status', [8, 9])
      .populate('user', { nickName: 1, avatarUrl: 1, phoneNum: 1 }, User.name)
      .sort({ createdAt: 'desc' })
      .exec();
  }

  getCurrentMonthOrder(orderList, userId) {
    return orderList.filter(
      (d) =>
        userId === d.userId &&
        [2, 7].includes(d.status) &&
        d.createdAt >= Moment().startOf('month').valueOf() &&
        d.createdAt <= Moment().endOf('month').valueOf(),
    );
  }
}
