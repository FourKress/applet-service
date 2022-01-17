import { Injectable, Logger } from '@nestjs/common';
import { Interval, Cron } from '@nestjs/schedule';

import * as utils from '../order/utils';

import { OrderService } from '../order/order.service';
import { MatchService } from '../match/match.service';
import { UsersService } from '../users/users.service';
import { UserRMatchService } from '../userRMatch/userRMatch.service';
import { WxService } from '../wx/wx.service';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';

const Moment = require('moment');

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
    private readonly userService: UsersService,
    private readonly userRMatchService: UserRMatchService,
    private readonly wxService: WxService,
    private readonly monthlyCardService: MonthlyCardService,
  ) {}

  @Cron('0 0 3,13,23 * * *')
  async handleUpdateCertificates() {
    console.log('获取证书');
    await this.wxService.updateCertificates();
  }

  @Cron('5 0 0 * * *')
  async handleMatch() {
    const matchList: any[] = await this.matchService.findAllBase();
    for (const item of matchList) {
      const match = item.toJSON();
      const { repeatFlag } = match;
      if (!repeatFlag) {
        await this.matchService.autoAddRepeatMatch(match, 'add');
      } else {
        const runDate = Moment().add(6, 'day').format('YYYY-MM-DD');
        await this.matchService.handleRepeatDay(match, runDate, 'add');
      }
    }
  }

  @Cron('2 0 0 * * *')
  async handleMonthlyCard() {
    const monthlyCardList: any[] = await this.monthlyCardService.findAll();
    for (const item of monthlyCardList) {
      const monthlyCard = item.toJSON();
      const { validPeriodEnd, id } = monthlyCard;
      const valid = Moment(validPeriodEnd).add(1, 'day').valueOf();
      const nowTime = Moment.now();
      if (nowTime >= valid) {
        await this.monthlyCardService.changeCardValid(id, false);
      }
    }
  }

  @Interval(1000 * 60 * 1)
  async handleOrderAwait() {
    const orderList: any[] = await this.orderService.findAwaitOrder();
    for (const item of orderList) {
      const nowTime = Moment.now();
      const order = item.toJSON();
      const { status, payAt, id } = order;
      const timerFlag = Moment(nowTime).diff(Moment(payAt), 'minutes') >= 1;
      if (timerFlag) {
        if (status === 5) {
          await this.wxService.getPayInfo(id);
        } else if (status === 4) {
          await this.wxService.getRefund(order.refundId);
        }
      }
    }
  }

  @Interval(1000 * 60 * 3)
  async handleOrderClose() {
    const orderList: any[] = await this.orderService.findCancelOrder();
    for (const item of orderList) {
      const nowTime = Moment.now();
      const order = item.toJSON();
      const { payAt, closeFlag } = order;
      if (
        !closeFlag &&
        payAt &&
        Moment(nowTime).diff(Moment(payAt), 'minutes') >= 5
      ) {
        await this.wxService.close(order.id);
      }
    }
  }

  @Interval(1000 * 5)
  async handleOrder() {
    const orderList: any[] = await this.orderService.findActiveOrder();
    for (const item of orderList) {
      const order = item.toJSON();
      const { createdAt, status, matchId, personCount, bossId } = order;
      const match = await this.matchService.findById(matchId);
      const { selectPeople, minPeople, runDate, startAt, endAt } = match;
      const successPeople = orderList
        .filter((d) => d.matchId === matchId && d.status !== 0)
        .reduce((sum, current) => sum + current.personCount, 0);
      const failMatch = successPeople < minPeople;
      const nowTime = Moment.now();
      const isStart =
        Moment(nowTime).diff(Moment(`${runDate} ${startAt}`), 'minutes') >= 0;
      const isEnd =
        Moment(nowTime).diff(Moment(`${runDate} ${endAt}`), 'minutes') >= 0;
      const realSelectPeople = selectPeople - personCount;

      if (
        status === 0 &&
        ((isStart && failMatch) ||
          Moment(nowTime).diff(Moment(createdAt), 'minutes') >=
            utils.countdown(createdAt, `${runDate} ${endAt}`, 'minutes'))
      ) {
        this.logger.log(`${order.id} 未支付 系统自动取消订单`);
        await this.changeOrder({
          ...order,
          status: 6,
        });
        await this.changeMatch({
          id: matchId,
          selectPeople: realSelectPeople,
        });
        await this.changeUserRMatch({
          matchId,
          count: realSelectPeople,
        });
      }

      if (status === 1) {
        if (isStart && !isEnd) {
          if (selectPeople < minPeople || failMatch) {
            this.logger.log(`${order.id} 组队失败 触发退款 系统自动取消订单`);
            const refundInfo: any = await this.orderService.handleSystemRefund(
              order.id,
            );
            await this.wxService.refund({
              orderId: order.id,
              refundAmount: refundInfo.refundAmount,
              refundId: refundInfo.refundId,
              payAmount: refundInfo.payAmount,
            });
          } else {
            this.logger.log(`${order.id} 组队成功 进行中`);
            await this.changeOrder({
              ...order,
              status: 7,
            });
          }
        }
      }

      if (status === 7) {
        if (isEnd) {
          this.logger.log(`${order.id} 组队成功 已结束 订单已完成`);
          await this.changeOrder({
            ...order,
            status: 2,
          });
          const userInfo = await this.userService.findByBossId(bossId);
          // TODO 计算提现余额
          const balanceAmt = userInfo.balanceAmt + order.payAmount;
          await this.changeBossUser({
            bossId,
            balanceAmt,
            withdrawAt: Moment.now(),
          });
          await this.userService.setUserTeamUpCount(order.userId);
        }
      }
    }
  }

  async changeOrder(order) {
    await this.orderService.modifyOrder(order);
  }

  async changeMatch(match) {
    await this.matchService.changeMatchSelectPeople(match);
  }

  async changeUserRMatch(data) {
    await this.userRMatchService.changeRCount(data);
  }

  async changeBossUser(data) {
    await this.userService.setBossBalanceAmt(data);
  }
}
