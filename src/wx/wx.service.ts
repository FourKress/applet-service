import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Payment from './payment';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class WxService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('auth.wxAppKey');
    this.appSecret = this.configService.get<string>('auth.wxAppSecret');
    this.mchId = this.configService.get<string>('auth.wxMchId');
    this.wxSerialNo = this.configService.get<string>('auth.wxSerialNo');
    this.wxPayDescription = this.configService.get<string>(
      'auth.wxPayDescription',
    );

    this.payment = new Payment({
      appId: this.appId,
      mchId: this.mchId,
      serial_no: this.wxSerialNo,
      description: this.wxPayDescription,
    });
  }

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly mchId: string;
  private readonly wxSerialNo: string;
  private readonly wxPayDescription: string;

  private readonly payment: any;

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

  async pay(order): Promise<any> {
    const { openId, orderId, payAmount } = order;
    const { status, ...result } = await this.payment.jsapi({
      out_trade_no: orderId,
      notify_url: 'http://2fbe-61-128-134-114.ngrok.io/api/wx/payReturn',
      amount: {
        total: payAmount,
      },
      payer: {
        openid: openId,
      },
    });
    if (status === 200) {
      return result;
    }
    ToolsService.fail('统一下单请求失败');
  }

  async payReturn(res): Promise<any> {
    console.log(res);
    return 'test123';
  }

  // //获取平台证书列表
  // async getCertificates() {
  //   const result = await this.run({ type: 'getCertificates' });
  //   console.log(result);
  //   return result;
  // }
  //
  // async run({ pathParams = '', queryParams = '', bodyParams = '', type }) {
  //   const { url, method, pathname } = payUrls[type]({
  //     pathParams,
  //     queryParams,
  //   });
  //   const timestamp = Math.floor(Date.now() / 1000).toString();
  //   const nonceStr = generate();
  //   const bodyParamsStr = '';
  //   const order = {
  //     appid: 'wx8e63001d0409fa13',
  //     mchid: '1618816466',
  //     description: '重庆动手科技有限公司-球场预定',
  //     out_trade_no: Types.ObjectId().toHexString(),
  //     notify_url: 'https://wx-test.qiuchangtong.xyz/api/wx/payReturn',
  //     amount: {
  //       total: 1,
  //     },
  //     payer: {
  //       openid: 'oY-gU5EPBWTe-ihHnTB7aQe_Azt0',
  //     },
  //   };
  //   const signature = rsaSign(
  //     `${method}\n${pathname}\n${timestamp}\n${nonceStr}\n${JSON.stringify(
  //       order,
  //     )}\n`,
  //   );
  //   const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="1618816466",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}",serial_no="1E88107138AC7EF98DC9741E4CF5AC5A012349A0"`;
  //
  //   const payReturn = await lastValueFrom(
  //     this.httpService.post(url, order, {
  //       headers: {
  //         Authorization,
  //       },
  //     }),
  //   );
  //   console.log(payReturn);
  //   const packageStr = `prepay_id=${payReturn.data.prepay_id}`;
  //
  //   return {
  //     package: packageStr,
  //     paySign: rsaSign(
  //       `wx8e63001d0409fa13\n${timestamp}\n${nonceStr}\n${packageStr}\n`,
  //     ),
  //     nonceStr,
  //     timestamp,
  //   };
  // }
}
