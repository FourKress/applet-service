import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

import { OrderModule } from '../order/order.module';

@Module({
  imports: [ScheduleModule.forRoot(), OrderModule],
  providers: [TasksService],
})
export class TasksModule {}
