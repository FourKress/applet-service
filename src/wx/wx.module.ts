import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { WxController } from './wx.controller';
import { WxService } from './wx.service';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from '../order/order.module';
import { UsersModule } from '../users/users.module';
import { WxGroupModule } from '../wxGroup/wxGroup.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    forwardRef(() => OrderModule),
    UsersModule,
    WxGroupModule,
  ],
  controllers: [WxController],
  providers: [WxService],
  exports: [WxService],
})
export class WxModule {}
