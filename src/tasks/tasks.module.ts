import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

import { OrderModule } from '../order/order.module';
import { MatchModule } from '../match/match.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ScheduleModule.forRoot(), OrderModule, MatchModule, UsersModule],
  providers: [TasksService],
})
export class TasksModule {}
