import {
  Controller,
  Get,
  Query,
  Post,
  HttpCode,
  HttpStatus,
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

  @NoAuth()
  @Get('getActivityId')
  async getActivityId(): Promise<string> {
    return await this.wxService.getActivityId();
  }

  @NoAuth()
  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(): Promise<any> {
    return await this.wxService.pay();
  }

  @NoAuth()
  @Post('payReturn')
  @HttpCode(HttpStatus.OK)
  async payReturn(res): Promise<any> {
    return await this.wxService.payReturn(res);
  }
}
