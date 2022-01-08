import { Module, HttpModule } from '@nestjs/common';
import { WxController } from './wx.controller';
import { WxService } from './wx.service';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [HttpModule, ConfigModule, OrderModule],
  controllers: [WxController],
  providers: [WxService],
  exports: [WxService],
})
export class WxModule {}
