import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Payment from './payment';
import { ToolsService } from '../common/utils/tools-service';
import { OrderService } from '../order/order.service';

@Injectable()
export class WxService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
  ) {
    this.appId = this.configService.get<string>('auth.wxAppKey');
    this.appSecret = this.configService.get<string>('auth.wxAppSecret');
    this.mchId = this.configService.get<string>('auth.wxMchId');
    this.wxSerialNo = this.configService.get<string>('auth.wxSerialNo');
    this.wxApiV3Key = this.configService.get<string>('auth.wxApiV3Key');
    this.wxPayDescription = this.configService.get<string>(
      'auth.wxPayDescription',
    );

    this.payment = new Payment({
      appId: this.appId,
      mchId: this.mchId,
      serial_no: this.wxSerialNo,
      wxApiV3Key: this.wxApiV3Key,
      description: this.wxPayDescription,
    });
  }

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly mchId: string;
  private readonly wxSerialNo: string;
  private readonly wxApiV3Key: string;
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

  async updateCertificates() {
    await this.payment.getCertificates(true);
  }

  async pay(order): Promise<any> {
    const { openId, orderId, payAmount } = order;
    const { status, ...result } = await this.payment.jsApi({
      out_trade_no: orderId,
      notify_url: 'https://wx-test.qiuchangtong.xyz/api/wx/payNotice',
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

  async payNotice(body, headers): Promise<any> {
    let msg = '签名失败';
    const valid = await this.payment.verifySign({
      body,
      headers,
    });
    if (valid) {
      const orderInfo = JSON.parse(
        this.payment.decode(body.resource, this.wxApiV3Key),
      );
      if (orderInfo) {
        const {
          out_trade_no,
          transaction_id,
          trade_state,
          mchid,
          appid,
          amount: { payer_total },
        } = orderInfo;
        if (
          mchid === this.mchId &&
          appid === this.appId &&
          trade_state === 'SUCCESS'
        ) {
          const orderFromDB: any = await this.orderService.getOrderById(
            out_trade_no,
          );
          const order = orderFromDB.toJSON();

          if (order.payAmount === payer_total && order.status === 5) {
            await this.orderService.modifyOrder({
              ...order,
              status: 1,
              wxOrderId: transaction_id,
              wxOrder: orderInfo,
            });
          }
        }
        return {
          type: 'WX_NOTICE-SUCCESS',
          code: 'SUCCESS',
          message: '成功',
        };
      }
      msg = '参数格式校验错误';
    }
    ToolsService.fail(`WX_NOTICE_FAIL--${msg}`, 403);
  }
}
