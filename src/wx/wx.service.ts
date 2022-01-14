import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Payment from './payment';
import { ToolsService } from '../common/utils/tools-service';
import { OrderService } from '../order/order.service';

const Moment = require('moment');

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

  async handleWxNotice(body, headers, type, cb) {
    let msg = '签名失败';
    const valid = await this.payment.verifySign({
      body,
      headers,
    });
    if (valid) {
      const resource = JSON.parse(
        this.payment.decode(body.resource, this.wxApiV3Key),
      );
      if (resource) {
        const status =
          resource[type === 'pay' ? 'trade_state' : 'refund_status'];
        console.log('resource', resource);
        if (resource.mchid === this.mchId && status === 'SUCCESS') {
          console.log('cb');
          if (cb) await cb(resource);
        }
        return {
          type: 'WX_NOTICE_SUCCESS',
          code: 'SUCCESS',
          message: '成功',
        };
      }
      msg = '参数格式校验错误';
    }
    ToolsService.fail(`WX_NOTICE_FAIL--${msg}`, 403);
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
    if (status !== 200) {
      ToolsService.fail('统一下单请求失败');
    }
    await this.orderService.modifyOrder({
      id: orderId,
      status: 5,
      prepayInfo: result,
      payAt: Moment.now(),
    });
    return result;
  }

  async payNotice(body, headers): Promise<any> {
    return await this.handleWxNotice(body, headers, 'pay', async (resource) => {
      const {
        out_trade_no,
        transaction_id,
        amount: { payer_total },
      } = resource;
      const orderFromDB: any = await this.orderService.getOrderById(
        out_trade_no,
      );
      const order = orderFromDB.toJSON();
      if (order.payAmount === payer_total && order.status === 5) {
        await this.orderService.modifyOrder({
          ...order,
          status: 1,
          wxOrderId: transaction_id,
        });
      }
    });
  }

  async refund(order): Promise<any> {
    const { orderId, refundAmount, refundId } = order;

    const { status, data, headers } = await this.payment.refund({
      out_trade_no: orderId,
      out_refund_no: refundId,
      notify_url: 'https://wx-test.qiuchangtong.xyz/api/wx/refundNotice',
      amount: {
        // TODO 临时设置
        // refund: refundAmount,
        // total: refundAmount,
        refund: 1,
        total: 1,
        currency: 'CNY',
      },
    });
    if (status !== 200) {
      ToolsService.fail('申请退款请求失败');
    }
    const valid = await this.payment.verifySign({
      body: data,
      headers,
    });
    if (!valid) {
      ToolsService.fail(`申请退款签名失败`, 403);
    }

    await this.orderService.orderRefund(orderId);

    return data;
  }

  async refundNotice(body, headers): Promise<any> {
    return await this.handleWxNotice(
      body,
      headers,
      'refund',
      async (resource) => {
        const {
          out_trade_no,
          refund_id,
          amount: { payer_refund },
        } = resource;
        const orderFromDB: any = await this.orderService.getOrderById(
          out_trade_no,
        );
        const order = orderFromDB.toJSON();
        console.log(order.refundAmount === payer_refund, order.status === 4);
        if (order.refundAmount === payer_refund && order.status === 4) {
          await this.orderService.modifyOrder({
            id: out_trade_no,
            status: 3,
            wxRefundId: refund_id,
          });
        }
      },
    );
  }

  async close(orderId): Promise<any> {
    const { status } = await this.payment.close({
      out_trade_no: orderId,
    });

    if (status !== 204) {
      ToolsService.fail('关闭订单失败');
    }

    await this.orderService.modifyOrder({
      id: orderId,
      closeFlag: true,
    });

    return true;
  }
}
