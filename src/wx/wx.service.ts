import { Injectable, HttpService, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Payment from './payment';
import { ToolsService } from '../common/utils/tools-service';
import { OrderService } from '../order/order.service';
import { UsersService } from '../users/users.service';
import { Y2FUnit } from '../constant';
import { WxGroupService } from '../wxGroup/wxGroup.service';
import { StadiumService } from '../stadium/stadium.service';
import { UnitEnum } from '../common/enum/space.enum';
import { wxBizDataCrypto } from './wxBizDataCrypto';
import currency from 'currency.js';
import { generate } from './payUtils';
import * as https from 'https';

const crypto = require('crypto');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const Moment = require('moment');

const errorMap = {
  PAYEE_ACCOUNT_ABNORMAL: '用户账户收款异常',
  PAYER_ACCOUNT_ABNORMAL: '商户账户付款受限',
  EXCEED_PAYEE_ACCOUNT_LIMIT: '用户账户收款受限',
  RECEIVED_MONEY_LIMIT: '已达到今日提现额度上限，请明日再试',
  SEND_MONEY_LIMIT: '已达到今日商户付款额度上限，请明日再试',
  SENDNUM_LIMIT: '已达到今日提现次数上限，请明日再试',
  V2_ACCOUNT_SIMPLE_BAN: '无法给未实名用户付款',
  MONEY_LIMIT: '已经达到今日商户付款额度上限或已达到提现额度上限',
  FREQ_LIMIT: '超过频率限制，请稍后再试。',
  SYSTEMERROR: '微信内部接口调用发生错误',
  SEND_FAILED: '付款错误',
  OPENID_ERROR: 'Openid错误',
  PARAM_ERROR: '参数错误',
  AMOUNT_LIMIT: '金额超限',
  NO_AUTH: '没有该接口权限',
};

@Injectable()
export class WxService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly usersService: UsersService,
    private readonly wxGroupService: WxGroupService,
    private readonly stadiumService: StadiumService,
  ) {
    this.appId = this.configService.get<string>('auth.wxAppKey');
    this.appSecret = this.configService.get<string>('auth.wxAppSecret');
    this.mchId = this.configService.get<string>('auth.wxMchId');
    this.wxSerialNo = this.configService.get<string>('auth.wxSerialNo');
    this.wxApiV3Key = this.configService.get<string>('auth.wxApiV3Key');
    this.wxApiV2Key = this.configService.get<string>('auth.wxApiV2Key');
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
  private readonly wxApiV2Key: string;
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
      amount: { total },
    } = resource;
    const orderFromDB: any = await this.orderService.getOrderById(out_trade_no);
    const order = orderFromDB.toJSON();
    if (
      order.payAmount === parseFloat((total / Y2FUnit).toFixed(2)) &&
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
          order.matchId.runDate,
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

  async applyWechatyBot(stadiumId, bossId): Promise<any> {
    const stadium: any = await this.stadiumService.modifyByWechatyBotStatus(
      stadiumId,
      true,
    );
    const user = await this.usersService.findByBossId(bossId);

    await lastValueFrom(
      this.httpService.post(
        'http://150.158.22.228:4927/wechaty/applyWechatyBot',
        {
          ...stadium.toJSON(),
          user,
        },
      ),
    );
  }

  async handleWithdraw(params): Promise<any> {
    const { withdrawAmt, openId, withdrawId, bossId } = params;

    const signObj = {
      mch_appid: this.appId,
      mchid: this.mchId,
      nonce_str: generate(),
      partner_trade_no: withdrawId,
      openid: openId,
      check_name: 'NO_CHECK',
      amount: parseFloat((withdrawAmt * Y2FUnit).toFixed(2)),
      desc: '场主提现',
      spbill_create_ip: '150.158.22.228',
      sign: '',
    };
    signObj.sign = this.getSignParam(signObj);
    const formData = this.getXmlParam(signObj);
    const httpsAgent = new https.Agent({
      rejectUnauthorized: true,
      key: fs.readFileSync(
        path.resolve(__dirname, '../../apiclient_key.pem'),
        'utf-8',
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, '../../apiclient_cert.pem'),
        'utf-8',
      ),
      passphrase: this.mchId,
    });
    const url =
      'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers';
    const wxResult = await lastValueFrom(
      this.httpService.request({
        url,
        method: 'POST',
        timeout: 15000,
        headers: {
          'content-type': 'application/json;charset=utf-8',
        },
        data: formData,
        httpsAgent,
      }),
    );

    let responseData = {};
    xml2js.parseString(wxResult.data, (error, result) => {
      const reData = result.xml;
      console.log(reData, error);
      const return_code = reData.return_code[0];
      const return_msg = reData.return_msg[0];

      if (return_code === 'SUCCESS') {
        const result_code = reData.result_code[0];

        if (result_code === 'SUCCESS') {
          responseData = {
            status: true,
            return_code,
            return_msg,
            result_code,
            wxWithdrawAt: reData.payment_time[0],
            wxWithdrawId: reData.payment_no[0],
          };
          this.withdrawNotice({
            bossId,
            withdrawAmt,
            withdrawStatus: true,
          });
        } else {
          const errCodeDes = reData.err_code_des.join();
          responseData = {
            status: false,
            err_code: reData.err_code.join(),
            err_code_des: errCodeDes,
            errMessage: errorMap[reData.err_code[0]],
            return_code,
            return_msg,
            result_code,
          };
          this.withdrawNotice({
            bossId,
            withdrawAmt,
            withdrawStatus: false,
            errCodeDes,
          });
        }
      } else {
        responseData = {
          status: false,
          return_code,
          return_msg,
        };
      }
    });
    return responseData;
  }

  getSignParam(obj) {
    const keys = Object.keys(obj).sort();
    const _arr = [];
    keys.forEach((key) => {
      if (obj[key]) {
        _arr.push(`${key}=${obj[key]}`);
      }
    });
    const signValue = crypto
      .createHash('md5')
      .update(`${_arr.join('&')}&key=${this.wxApiV2Key}`)
      .digest('hex');

    return signValue;
  }

  // 请求时的xml参数
  getXmlParam(obj) {
    let _xml = '<xml>';
    for (const key in obj) {
      _xml += `<${key}>${obj[key]}</${key}>`;
    }
    _xml = _xml + '</xml>';
    return _xml;
  }

  async withdrawNotice(withdrawInfo): Promise<any> {
    const { bossId, ...info } = withdrawInfo;
    const user: any = await this.usersService.findByBossId(bossId);
    await lastValueFrom(
      this.httpService.post(
        'http://150.158.22.228:4927/wechaty/withdrawNotice',
        {
          ...user.toJSON(),
          ...info,
        },
      ),
    );
  }
}
