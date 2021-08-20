import { Controller, Get, Query } from '@nestjs/common';
import { WxService } from './wx.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('wx')
export class WxController {
  constructor(private readonly wxService: WxService) {}

  @NoAuth()
  @Get('code2Session')
  async code2Session(@Query() params: any): Promise<IResponse> {
    const wxInfo = await this.wxService.code2Session(params.code);
    if (wxInfo) {
      return new ResponseSuccess('COMMON.SUCCESS', wxInfo);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @NoAuth()
  @Get('getActivityId')
  async getActivityId(): Promise<IResponse> {
    const activityId = await this.wxService.getActivityId();
    if (activityId) {
      return new ResponseSuccess('COMMON.SUCCESS', activityId);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
