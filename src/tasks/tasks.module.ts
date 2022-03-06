import { Module, HttpModule } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ScheduleModule } from '@nestjs/schedule';

import { OrderModule } from '../order/order.module';
import { MatchModule } from '../match/match.module';
import { UsersModule } from '../users/users.module';
import { UserRMatchModule } from '../userRMatch/userRMatch.module';
import { WxModule } from '../wx/wx.module';
import { MonthlyCardModule } from '../monthly-card/monthly-card.module';
import { WxGroupModule } from '../wxGroup/wxGroup.module';
import { StadiumModule } from '../stadium/stadium.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    OrderModule,
    MatchModule,
    UsersModule,
    UserRMatchModule,
    WxModule,
    MonthlyCardModule,
    WxGroupModule,
    StadiumModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
