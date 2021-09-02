import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { OrderService } from '../order/order.service';
import { MatchService } from '../match/match.service';
import { UsersService } from '../users/users.service';
import { UserRMatchService } from '../userRMatch/userRMatch.service';
import * as utils from '../order/utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
    private readonly userService: UsersService,
    private readonly userRMatchService: UserRMatchService,
  ) {}

  // @Cron('0 * * * * *')
  @Interval(1000 * 5)
  async handleCron() {
    this.logger.log('function 5s loop');
    const orderList: any[] = await this.orderService.findActiveOrder();

    for (const item of orderList) {
      const order = item.toJSON();
      const { createdAt, status, matchId, personCount, bossId, isMonthlyCard } =
        order;
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
        this.logger.log('取消订单');
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
            this.logger.log('组队失败 触发退款 取消订单');
            await this.changeOrder({
              ...order,
              refundType: 1,
              status: 4,
            });
            // TODO 处理退款
          } else {
            this.logger.log('组队成功 进行中');
            await this.changeOrder({
              ...order,
              status: 7,
            });
          }
        }
      }

      if (status === 7) {
        if (isEnd) {
          this.logger.log('组队成功 已结束 订单已完成');
          await this.changeOrder({
            ...order,
            status: 2,
          });
          const userInfo = await this.userService.findByBossId(bossId);
          // TODO 计算提现余额
          const balanceAmt =
            userInfo.balanceAmt + (!isMonthlyCard ? order.payAmount : 0);
          await this.changeBossUser({
            bossId,
            balanceAmt,
            withdrawAt: Moment.now(),
          });
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
