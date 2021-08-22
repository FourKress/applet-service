import { Controller, Get, Query } from '@nestjs/common';
import { WxService } from './wx.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('wx')
export class WxController {
  constructor(private readonly wxService: WxService) {}

  @NoAuth()
  @Get('code2Session')
  async code2Session(@Query() params: any): Promise<IResponse> {
    const wxInfo = await this.wxService.code2Session(params.code);
    return new ResponseSuccess(wxInfo);
  }

  @NoAuth()
  @Get('getActivityId')
  async getActivityId(): Promise<IResponse> {
    const activityId = await this.wxService.getActivityId();
    return new ResponseSuccess(activityId);
  }
}
