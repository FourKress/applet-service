import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Types } from 'mongoose';
const { KJUR, hextob64 } = require('jsrsasign');
const fs = require('fs');
const crypto = require('crypto');

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
    return await this.getCertificates();
    // const out_trade_no = Types.ObjectId().toHexString();
    // const wechatPayUrl =
    //   'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
    // const payReturn = await lastValueFrom(
    //   this.httpService.post(
    //     wechatPayUrl,
    //     {
    //       appid: 'wx8e63001d0409fa13',
    //       mchid: '1618816466',
    //       description: '重庆动手科技有限公司-球场预定',
    //       out_trade_no,
    //       notify_url: 'https://wx-test.qiuchangtong.xyz/wx/payReturn',
    //       amount: {
    //         total: 1,
    //       },
    //       payer: {
    //         openid: 'orIr15QcgshnKROKaY3zyKSdV1XY',
    //       },
    //     },
    //     {
    //       headers: {
    //         Authorization: '',
    //       },
    //     },
    //   ),
    // );
    // console.log(payReturn);
  }

  async payReturn(res): Promise<any> {
    console.log(res);
  }

  //获取平台证书列表
  async getCertificates() {
    const result = await this.run({ type: 'getCertificates' });
    console.log(result);
    return result;
  }

  private urls = {
    getCertificates: () => {
      return {
        url: `https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi`,
        method: `POST`,
        pathname: `/v3/pay/transactions/jsapi`,
      };
    },
  };

  async run({ pathParams = '', queryParams = '', bodyParams = '', type }) {
    const { url, method, pathname } = this.urls[type]({
      pathParams,
      queryParams,
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const randomStr = this.generate();
    const bodyParamsStr = '';
    const order = {
      appid: 'wx8e63001d0409fa13',
      mchid: '1618816466',
      description: '重庆动手科技有限公司-球场预定',
      out_trade_no: Types.ObjectId().toHexString(),
      notify_url: 'https://wx-test.qiuchangtong.xyz/api/wx/payReturn',
      amount: {
        total: 1,
      },
      payer: {
        openid: 'oY-gU5EPBWTe-ihHnTB7aQe_Azt0',
      },
    };
    const signature = this.rsaSign(
      `${method}\n${pathname}\n${timestamp}\n${randomStr}\n${JSON.stringify(
        order,
      )}\n`,
    );
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="1618816466",nonce_str="${randomStr}",timestamp="${timestamp}",signature="${signature}",serial_no="1E88107138AC7EF98DC9741E4CF5AC5A012349A0"`;
    // const { status, data } = await lastValueFrom(
    //   ,
    // );
    // return { status, data };
    // this.httpService.request({
    //   url,
    //   method: method,
    //   data: method == 'GET' ? '' : bodyParams,
    //   timeout: 15000,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Accept: 'application/json',
    //     Authorization: Authorization,
    //   },
    // });

    const payReturn = await lastValueFrom(
      this.httpService.post(url, order, {
        headers: {
          Authorization,
        },
      }),
    );
    console.log(payReturn);

    return {
      package: `prepay_id=${payReturn.data.prepay_id}`,
      paySign: this.rsaSign(
        `${method}\n${pathname}\n${timestamp}\n${randomStr}\n${JSON.stringify({
          appId: 'wx8e63001d0409fa13',
          mchid: '1618816466',
          description: '重庆动手科技有限公司-球场预定',
          out_trade_no: Types.ObjectId().toHexString(),
          notify_url: 'https://wx-test.qiuchangtong.xyz/api/wx/payReturn',
          amount: {
            total: 1,
          },
          payer: {
            openid: 'oY-gU5EPBWTe-ihHnTB7aQe_Azt0',
          },
        })}\n`,
      ),
      randomStr,
      timestamp,
    };
  }

  //生成随机字符串
  generate(length = 32) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    const maxPos = chars.length;
    while (length--) str += chars[(Math.random() * maxPos) | 0];
    return str;
  }

  /**
   * rsa签名
   * @param content 签名内容
   * @param privateKey 私钥，PKCS#1
   * @param hash hash算法，SHA256withRSA，SHA1withRSA
   * @returns 返回签名字符串，base64
   */
  rsaSign(signStr) {
    const cert = fs.readFileSync('./apiclient_key.pem', 'utf-8');
    const sign = crypto.createSign('RSA-SHA256');
    console.log(crypto.getHashes());
    sign.update(signStr);
    return sign.sign(cert, 'base64');
  }
}
