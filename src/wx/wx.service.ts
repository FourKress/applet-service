import { Injectable, HttpService, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Payment from './payment';
import { ToolsService } from '../common/utils/tools-service';
import { OrderService } from '../order/order.service';
import { UsersService } from '../users/users.service';
import { Y2FUnit } from '../constant';
import { WxGroupService } from '../wxGroup/wxGroup.service';
import { UnitEnum } from '../common/enum/space.enum';
import { wxBizDataCrypto } from './wxBizDataCrypto';
import currency from 'currency.js';

const Moment = require('moment');

@Injectable()
export class WxService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly usersService: UsersService,
    private readonly wxGroupService: WxGroupService,
  ) {
    this.appId = this.configService.get<string>('auth.wxAppKey');
    this.appSecret = this.configService.get<string>('auth.wxAppSecret');
    this.mchId = this.configService.get<string>('auth.wxMchId');
    this.wxSerialNo = this.configService.get<string>('auth.wxSerialNo');
    this.wxApiV3Key = this.configService.get<string>('auth.wxApiV3Key');
    this.serverAddress = this.configService.get<string>('auth.audience');
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
  private readonly serverAddress: string;

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

  async getPhoneNumber({
    userId,
    code = '',
    sessionKey = '',
    encryptedData = '',
    iv = '',
  }) {
    const token = `grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
    const accessTokenResult = await lastValueFrom(
      this.httpService.get(`https://api.weixin.qq.com/cgi-bin/token?${token}`),
    );
    const accessToken = accessTokenResult.data?.access_token;

    let phoneNumber;
    if (code) {
      const phoneNumberInfo = await lastValueFrom(
        this.httpService.post(
          `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
          {
            code,
          },
        ),
      );
      phoneNumber = phoneNumberInfo.data?.phone_info?.phoneNumber;
    } else {
      const phoneNumberInfo = wxBizDataCrypto(
        this.appId,
        sessionKey,
        encryptedData,
        iv,
      );
      phoneNumber = phoneNumberInfo?.phoneNumber;
    }

    await this.usersService.modify({
      id: userId,
      phoneNum: phoneNumber,
      bossPhoneNum: phoneNumber,
    });
    return phoneNumber;
  }

  async updateCertificates() {
    await this.payment.getCertificates(true);
  }

  async handleWxNotice(body, headers, type) {
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
        const isPay = type === 'pay';
        const status = resource[isPay ? 'trade_state' : 'refund_status'];
        console.log('resource', resource);
        if (resource.mchid === this.mchId) {
          if (status === 'SUCCESS') {
            console.log('cb');
            if (isPay) {
              await this.handlePaySuccess(resource);
            } else {
              await this.handleRefundSuccess(resource);
            }
          } else {
            console.log('error cb');
            if (isPay) {
              await this.handlePayError(resource.out_trade_no);
            } else {
              await this.handleRefundError(resource.out_trade_no);
            }
          }
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

  async handleRefundSuccess(resource) {
    const {
      out_trade_no,
      refund_id,
      amount: { payer_refund },
    } = resource;
    const orderFromDB: any = await this.orderService.getOrderById(out_trade_no);
    const order = orderFromDB.toJSON();
    const { payAmount, refundAmount, status, bossId, isCompensate } = order;
    console.log(
      refundAmount === parseFloat((payer_refund / Y2FUnit).toFixed(2)),
      status === 4,
    );
    if (
      refundAmount === parseFloat((payer_refund / Y2FUnit).toFixed(2)) &&
      status === 4
    ) {
      const userInfo = await this.usersService.findByBossId(bossId);
      const addBalanceAmt = payAmount - refundAmount;
      if (addBalanceAmt > 0) {
        const balanceAmt = userInfo.balanceAmt + addBalanceAmt;
        await this.usersService.setBossBalanceAmt({
          bossId,
          balanceAmt,
          withdrawAt: Moment.now(),
        });
      }

      await this.orderService.modifyOrder({
        id: out_trade_no,
        status: isCompensate ? 7 : 3,
        wxRefundId: refund_id,
      });
      if (order.refundType === 2) {
        await this.handleWechatyBotNotice(order, 'refundNotice');
      }
    }
  }

  async handleRefundError(orderId) {
    await this.orderService.modifyOrder({
      id: orderId,
      status: 9,
    });
  }

  async handlePaySuccess(resource) {
    const {
      out_trade_no,
      transaction_id,
      amount: { payer_total },
      promotion_detail = [],
    } = resource;
    const promotionAmt = promotion_detail.reduce(
      (sum, curr) => currency(sum).add(curr?.amount || 0).value,
      0,
    );
    const orderFromDB: any = await this.orderService.getOrderById(out_trade_no);
    const order = orderFromDB.toJSON();
    if (
      order.payAmount ===
        parseFloat(((payer_total + promotionAmt) / Y2FUnit).toFixed(2)) &&
      order.status === 5
    ) {
      await this.orderService.modifyOrder({
        id: order.id,
        status: 1,
        wxOrderId: transaction_id,
      });
      if (order.newMonthlyCard) {
        await this.orderService.addMonthlyCard(
          order.userId,
          order.stadiumId.id,
        );
      }
      await this.handleWechatyBotNotice(order, 'sendMiniProgram');
    }
  }

  async handlePayError(orderId) {
    await this.orderService.handleMatchRestore(orderId);
    await this.orderService.modifyOrder({
      id: orderId,
      status: 8,
    });
  }

  async pay(order): Promise<any> {
    const { openId, orderId, payAmount } = order;
    const { status, ...result } = await this.payment.jsApi({
      out_trade_no: orderId,
      notify_url: `${this.serverAddress}/api/wx/payNotice`,
      amount: {
        total: parseFloat((payAmount * Y2FUnit).toFixed(2)),
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

  async refund(order): Promise<any> {
    const {
      orderId,
      refundAmount,
      payAmount,
      refundId,
      refundType = 2,
    } = order;
    const orderFromDB = await this.orderService.getOrderById(orderId);
    if ([4, 3].includes(orderFromDB.status)) {
      return;
    }
    const { status, data, headers } = await this.payment.refund({
      out_trade_no: orderId,
      out_refund_no: refundId,
      notify_url: `${this.serverAddress}/api/wx/refundNotice`,
      amount: {
        refund: parseFloat((refundAmount * Y2FUnit).toFixed(2)),
        total: parseFloat((payAmount * Y2FUnit).toFixed(2)),
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

    await this.orderService.orderRefund({
      orderId,
      status: orderFromDB.isCompensate ? 7 : 4,
      refundType,
    });

    return data;
  }

  async payNotice(body, headers): Promise<any> {
    return await this.handleWxNotice(body, headers, 'pay');
  }

  async refundNotice(body, headers): Promise<any> {
    return await this.handleWxNotice(body, headers, 'refund');
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

  async getPayInfo(out_trade_no): Promise<any> {
    const { status, data, headers } = await this.payment.getPayInfo({
      out_trade_no,
      mchId: this.mchId,
    });

    if (status !== 200) {
      ToolsService.fail('查询订单请求失败');
    }
    const valid = await this.payment.verifySign({
      body: data,
      headers,
    });
    if (!valid) {
      ToolsService.fail(`查询订单请签名失败`, 403);
    }

    if (data.trade_state === 'SUCCESS') {
      await this.handlePaySuccess(data);
    } else {
      await this.handlePayError(out_trade_no);
    }

    return data;
  }

  async getRefund(out_refund_no): Promise<any> {
    const { status, data, headers } = await this.payment.getRefund({
      out_refund_no,
    });

    if (status !== 200) {
      ToolsService.fail('查询退款请求失败');
    }
    const valid = await this.payment.verifySign({
      body: data,
      headers,
    });
    if (!valid) {
      ToolsService.fail(`查询退款请签名失败`, 403);
    }

    console.log(data);

    if (data.status === 'SUCCESS') {
      await this.handleRefundSuccess(data);
    } else {
      await this.handleRefundError(out_refund_no);
    }

    return data;
  }

  async wechatyBotNotice({ orderId, url }): Promise<any> {
    const orderFromDB: any = await this.orderService.getOrderById(orderId);
    const order = orderFromDB.toJSON();
    await this.handleWechatyBotNotice(order, url);
  }

  async handleWechatyBotNotice(order, url): Promise<any> {
    const wxGroup = await this.wxGroupService.findByStadiumId(
      order.stadiumId.id,
    );
    if (!wxGroup.wxGroupId) {
      return '';
    }

    await lastValueFrom(
      this.httpService.post(`http://150.158.22.228:4927/wechaty/${url}`, {
        ...order,
        unitName: UnitEnum.find((d) => d.value === order.spaceId.unit)?.label,
        wxGroupId: wxGroup.wxGroupId,
      }),
    );
  }
}
