import { Controller, Get, Query } from '@nestjs/common';
import { WxService } from './wx.service';

@Controller('wx')
export class WxController {
  constructor(private readonly wxService: WxService) {}

  @Get('code2Session')
  async code2Session(@Query() params: any) {
    const wxInfo = await this.wxService.code2Session(params.code);
    if (!wxInfo) {
      return {
        msg: '获取openId失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: wxInfo,
      code: 10000,
    };
  }

  @Get('getActivityId')
  async getActivityId() {
    const activityId = await this.wxService.getActivityId();
    if (!activityId) {
      return {
        msg: '获取ActivityId失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: activityId,
      code: 10000,
    };
  }
}
