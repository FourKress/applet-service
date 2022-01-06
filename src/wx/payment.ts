import { HttpService } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { rsaSign, generate } from './payUtils';
import { payUrls } from './payUrls';
import { ToolsService } from '../common/utils/tools-service';

export default class Payment {
  private readonly appId: string;
  private readonly mchId: string;
  private readonly serial_no: string;
  private readonly description: string;

  private httpService = new HttpService();

  constructor({ appId, mchId, serial_no, description }) {
    this.appId = appId;
    this.mchId = mchId;
    this.serial_no = serial_no;
    this.description = description;
  }

  async run({ pathParams = {}, queryParams = {}, bodyParams = {}, type }) {
    const { url, method, pathname } = payUrls[type]({
      pathParams,
      queryParams,
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = generate();
    const bodyParamsStr =
      bodyParams && Object.keys(bodyParams).length
        ? JSON.stringify(bodyParams)
        : '';

    const signature = rsaSign(
      `${method}\n${pathname}\n${timestamp}\n${nonceStr}\n${bodyParamsStr}\n`,
    );
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`;

    try {
      const { status, data } = await lastValueFrom(
        this.httpService.request({
          url,
          method,
          data: method == 'GET' ? '' : bodyParams,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: Authorization,
          },
        }),
      );
      const packageStr = `prepay_id=${data.prepay_id}`;

      return {
        status,
        package: packageStr,
        paySign: rsaSign(
          `${this.appId}\n${timestamp}\n${nonceStr}\n${packageStr}\n`,
        ),
        nonceStr,
        timestamp,
      };
    } catch (e) {
      console.log(e);
      ToolsService.fail('统一下单请求失败');
    }
  }

  // jsApi统一下单
  async jsapi(params) {
    const bodyParams = {
      ...params,
      appid: this.appId,
      mchid: this.mchId,
      description: this.description,
    };
    return await this.run({ bodyParams, type: 'jsapi' });
  }
}
