import { HttpService } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { rsaSign, generate } from './payUtils';
import { payUrls } from './payUrls';

export default class Payment {
  private readonly appId: string;
  private readonly mchId: string;
  private readonly serial_no: string;
  private readonly notify_url: string;

  constructor(
    { appId, mchId, serial_no, notify_url },
    private readonly httpService: HttpService,
  ) {
    this.appId = appId;
    this.mchId = mchId;
    this.serial_no = serial_no;
    this.notify_url = notify_url;
  }

  async run({ pathParams, queryParams, bodyParams, type }) {
    console.log(pathParams, queryParams, bodyParams, type);
    const { url, method, pathname } = payUrls[type]({
      pathParams,
      queryParams,
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce_str = generate();
    const bodyParamsStr =
      bodyParams && Object.keys(bodyParams).length
        ? JSON.stringify(bodyParams)
        : '';

    const signature = rsaSign(
      `${method}\n${pathname}\n${timestamp}\n${nonce_str}\n${bodyParamsStr}\n`,
    );
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`;

    const payReturn = await this.httpService.request({
      url,
      method,
      data: method == 'GET' ? '' : bodyParams,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: Authorization,
      },
    });
    console.log(payReturn);
    return payReturn;

    // const { status, data } = await lastValueFrom();
    // return { status, data };
  }
}
