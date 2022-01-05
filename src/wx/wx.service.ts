import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Types } from 'mongoose';
import Payment from './payment';

@Injectable()
export class WxService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('auth.wxAppKey');
    this.appSecret = this.configService.get<string>('auth.wxAppSecret');
    this.payment = new Payment(
      {
        appId: this.appId,
        mchId: '1618816466',
        serial_no: '1E88107138AC7EF98DC9741E4CF5AC5A012349A0',
        notify_url: 'https://wx-test.qiuchangtong.xyz/wx/payReturn',
      },
      this.httpService,
    );
  }

  private readonly appId: string;
  private readonly appSecret: string;
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

  async pay(): Promise<any> {
    const payReturn = await lastValueFrom(
      this.payment.run({
        bodyParams: {
          appid: 'wx8e63001d0409fa13',
          mchid: '1618816466',
          description: '重庆动手科技有限公司-球场预定',
          out_trade_no: '123123234432243',
          notify_url: 'https://wx-test.qiuchangtong.xyz/wx/payReturn',
          amount: {
            total: 1,
          },
          payer: {
            openid: 'oY-gU5EPBWTe-ihHnTB7aQe_Azt0',
          },
        },
        type: 'sendTransactions',
      }),
    );

    console.log('@@@@@@', payReturn);
    return payReturn;
  }

  async payReturn(res): Promise<any> {
    console.log(res);
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
