import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

import { OrderModule } from '../order/order.module';
import { MatchModule } from '../match/match.module';
import { UsersModule } from '../users/users.module';
import { UserRMatchModule } from '../userRMatch/userRMatch.module';
import { WxModule } from '../wx/wx.module';
import { MonthlyCardModule } from '../monthly-card/monthly-card.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    OrderModule,
    MatchModule,
    UsersModule,
    UserRMatchModule,
    WxModule,
    MonthlyCardModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
