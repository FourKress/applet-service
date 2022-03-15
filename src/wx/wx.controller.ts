import {
  Controller,
  Get,
  Query,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Headers,
} from '@nestjs/common';
import { WxService } from './wx.service';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('wx')
export class WxController {
  constructor(private readonly wxService: WxService) {}

  @NoAuth()
  @Get('code2Session')
  async code2Session(@Query() params: any): Promise<string> {
    return await this.wxService.code2Session(params.code);
  }

  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(@Body() order): Promise<any> {
    return await this.wxService.pay(order);
  }

  @NoAuth()
  @Post('payNotice')
  @HttpCode(HttpStatus.OK)
  async payNotice(@Headers() headers, @Body() body): Promise<any> {
    return await this.wxService.payNotice(body, headers);
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  async refund(@Body() order): Promise<any> {
    return await this.wxService.refund(order);
  }

  @NoAuth()
  @Post('refundNotice')
  @HttpCode(HttpStatus.OK)
  async refundNotice(@Headers() headers, @Body() body): Promise<any> {
    return await this.wxService.refundNotice(body, headers);
  }

  @NoAuth()
  @Post('wechatyBotNotice')
  @HttpCode(HttpStatus.OK)
  async wechatyBotNotice(@Body('orderId') orderId): Promise<any> {
    return await this.wxService.wechatyBotNotice(orderId);
  }
}
