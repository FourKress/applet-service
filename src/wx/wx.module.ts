import { Module, HttpModule } from '@nestjs/common';
import { WxController } from './wx.controller';
import { WxService } from './wx.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WxController],
  providers: [WxService],
})
export class WxModule {}
