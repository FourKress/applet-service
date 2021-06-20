import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

import { OrderService } from '../order/order.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private readonly orderService: OrderService) {}

  @Cron('0 * * * * *')
  async handleCron() {
    this.logger.debug('该方法将在0秒标记处每分钟运行一次');
    const list = await this.orderService.findAll();
    console.log(list);
    list.forEach((item) => {
      const { createdAt } = item;
      if (Moment(Moment.now()).diff(Moment(createdAt), 'minutes') >= 30) {
        this.orderService.modifyOrder({
          ...item,
          status: 1,
        });
      }
    });
  }

  @Interval(10000)
  handleInterval122() {
    this.logger.debug('2');
  }

  @Timeout(5000)
  handleTimeout() {
    this.logger.debug('3');
  }
}
