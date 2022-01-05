import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Types } from 'mongoose';

@Injectable()
export class WxService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('auth.wxAppKey');
    this.appSecret = this.configService.get<string>('auth.wxAppSecret');
  }

  private readonly appId: string;
  private readonly appSecret: string;

  async code2Session(code: string): Promise<string> {
    const params = `appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await lastValueFrom(
      this.httpService.get(
        `https://api.weixin.qq.com/sns/jscode2session?${params}`,
      ),
    );
    return res.data;
  }

  async getActivityId(): Promise<string> {
    const params = `grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
    const accessToken = (
      await lastValueFrom(
        this.httpService.get(
          `https://api.weixin.qq.com/cgi-bin/token?${params}`,
        ),
      )
    ).data?.access_token;
    const activityId = (
      await lastValueFrom(
        this.httpService.get(
          `https://api.weixin.qq.com/cgi-bin/message/wxopen/activityid/create?access_token=${accessToken}`,
        ),
      )
    ).data?.activity_id;
    return activityId;
  }

  async pay(): Promise<any> {
    const out_trade_no = Types.ObjectId().toHexString();
    const wechatPayUrl =
      'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
    const payReturn = await lastValueFrom(
      this.httpService.post(wechatPayUrl, {
        appid: 'wx8e63001d0409fa13',
        mchid: '1618816466',
        description: '重庆动手科技有限公司-球场预定',
        out_trade_no,
        notify_url: 'https://wx-test.qiuchangtong.xyz/wx/payReturn',
        amount: {
          total: 1,
        },
        payer: {
          openid: 'orIr15QcgshnKROKaY3zyKSdV1XY',
        },
      }),
    );
    console.log(payReturn);
  }

  async payReturn(res): Promise<any> {
    console.log(res);
    return 'test';
  }
}
