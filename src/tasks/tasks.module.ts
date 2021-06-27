import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

import { OrderModule } from '../order/order.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [ScheduleModule.forRoot(), OrderModule, MatchModule],
  providers: [TasksService],
})
export class TasksModule {}
