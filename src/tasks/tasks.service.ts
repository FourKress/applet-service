import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { OrderService } from '../order/order.service';
import { MatchService } from '../match/match.service';
import * as utils from '../order/utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
  ) {}

  // @Cron('0 * * * * *')
  @Interval(1000 * 10)
  async handleCron() {
    this.logger.log('该方法每10秒运行一次');
    const orderList = await this.orderService.findAll();
    for (const order of orderList) {
      const { createdAt, status, matchId } = order;
      const match = await this.matchService.findById(matchId);

      if (
        status === 0 &&
        Moment(Moment.now()).diff(Moment(createdAt), 'minutes') >=
          utils.countdown(order.createdAt, match.endAt)
      ) {
        this.logger.log('取消订单');
        await this.changeOrder({
          ...order,
          status: 6,
        });
      }

      if (status === 1) {
        const nowTime = Moment.now();
        const isStart =
          Moment(nowTime).diff(Moment(match.startAt), 'minutes') >= 0;
        const isEnd = Moment(nowTime).diff(Moment(match.endAt), 'minutes') >= 0;
        if (isEnd) {
          this.logger.log('组队成功 已结束 订单已完成');
          await this.changeOrder({
            ...order,
            status: 2,
          });
        } else if (isStart && !isEnd) {
          if (match.selectPeople <= match.minPeople) {
            this.logger.log('组队失败 触发退款 取消订单');
            await this.changeOrder({
              ...order,
              status: 4,
            });
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
}
