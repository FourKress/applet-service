import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { OrderService } from '../order/order.service';
import { MatchService } from '../match/match.service';
import { UsersService } from '../users/users.service';
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
  ) {}

  // @Cron('0 * * * * *')
  @Interval(1000 * 5)
  async handleCron() {
    this.logger.log('function 5s loop');
    const orderList: any[] = await this.orderService.findAll();
    for (const item of orderList) {
      const order = item.toJSON();
      const { createdAt, status, matchId, personCount } = order;
      const match = await this.matchService.findById(matchId);
      const { selectPeople, minPeople, runDate, startAt, endAt } = match;

      if (
        status === 0 &&
        Moment(Moment.now()).diff(Moment(createdAt), 'minutes') >=
          utils.countdown(createdAt, `${runDate} ${endAt}`, 'minutes')
      ) {
        this.logger.log('取消订单');
        await this.changeOrder({
          ...order,
          status: 6,
        });
        await this.changeMatch({
          id: matchId,
          selectPeople: selectPeople - personCount,
        });
      }

      if (status === 1) {
        const nowTime = Moment.now();
        const isStart =
          Moment(nowTime).diff(Moment(`${runDate} ${startAt}`), 'minutes') >= 0;
        const isEnd =
          Moment(nowTime).diff(Moment(`${runDate} ${endAt}`), 'minutes') >= 0;
        if (isEnd) {
          this.logger.log('组队成功 已结束 订单已完成');
          await this.changeOrder({
            ...order,
            status: 2,
          });
          // TODO 计算提现余额
        } else if (isStart && !isEnd) {
          const successOrder = orderList.filter(
            (d) => d.matchId === match && d.status === 1,
          );
          if (
            selectPeople < minPeople ||
            selectPeople !== successOrder.length
          ) {
            this.logger.log('组队失败 触发退款 取消订单');
            await this.changeOrder({
              ...order,
              status: 4,
            });
            await this.changeMatch({
              id: matchId,
              selectPeople: selectPeople - personCount,
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
    }
  }

  async changeOrder(order) {
    await this.orderService.modifyOrder(order);
  }

  async changeMatch(match) {
    await this.matchService.changeMatchSelectPeople(match);
  }
}
