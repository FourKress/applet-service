import {
  Controller,
  Get,
  Query,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Headers,
  Request,
} from '@nestjs/common';
import { WxService } from './wx.service';
import { NoAuth } from '../common/decorators/no-auth.decorator';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('wx')
export class WxController {
  constructor(private readonly wxService: WxService) {}

  @NoAuth()
  @Get('code2Session')
  async code2Session(@Query() params: any): Promise<string> {
    return await this.wxService.code2Session(params.code);
  }

  @NoAuth()
  @Post('getPhoneNumber')
  @HttpCode(HttpStatus.OK)
  async getPhoneNumber(@Body() params): Promise<string> {
    return await this.wxService.getPhoneNumber(params);
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

  @Post('wechatyBotNotice')
  @HttpCode(HttpStatus.OK)
  async wechatyBotNotice(@Body() params): Promise<any> {
    return await this.wxService.wechatyBotNotice(params);
  }

  @Get('applyWechatyBot')
  async applyWechatyBot(@Request() req, @Query() params): Promise<any> {
    const tokenInfo: UserEntity = req.user;
    const bossId = params?.bossId;
    const stadiumId = params?.stadiumId;
    return await this.wxService.applyWechatyBot(
      stadiumId,
      bossId || tokenInfo.bossId,
    );
  }

  @NoAuth()
  @Post('unlimited')
  @HttpCode(HttpStatus.OK)
  async getUnlimited(): Promise<any> {
    return await this.wxService.getUnlimited();
  }
}
