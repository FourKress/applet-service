import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { WxService } from './wx.service';

@Controller('wx')
export class WxController {
  constructor(private readonly wxService: WxService) {}

  @Get('code2Session')
  async code2Session(@Query() params: any) {
    return this.wxService.code2Session(params.code);
  }
}
