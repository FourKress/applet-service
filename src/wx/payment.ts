import { HttpService } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
const crypto = require('crypto');
const x509 = require('@peculiar/x509');
import { rsaSign, generate, decode } from './payUtils';
import { payUrls } from './payUrls';
import { ToolsService } from '../common/utils/tools-service';

export default class Payment {
  private readonly appId: string;
  private readonly mchId: string;
  private readonly serial_no: string;
  private readonly wxApiV3Key: string;
  private readonly description: string;

  private certificates: any;

  private httpService = new HttpService();

  constructor({ appId, mchId, serial_no, wxApiV3Key, description }) {
    this.appId = appId;
    this.mchId = mchId;
    this.serial_no = serial_no;
    this.wxApiV3Key = wxApiV3Key;
    this.description = description;

    this.decodeCertificates().then(() => {
      console.log('!!!!!!!!!!更新平台证书成功!!!!!!!!!!');
    });
  }

  decode(resource, wxApiV3Key) {
    return decode(resource, wxApiV3Key);
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
      const { status, data, headers } = await lastValueFrom(
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

      if (type === 'jsApi') {
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
      }
      return {
        status,
        data,
        headers,
      };
    } catch (e) {
      console.log(e);
      ToolsService.fail(`${url} --> 接口请求失败`);
    }
  }

  // 解密证书列表 解出CERTIFICATE以及public key
  async decodeCertificates() {
    const { data, status }: any = await this.getCertificates();
    if (status !== 200) {
      throw new Error('获取证书列表失败');
    }
    const certificates =
      typeof data.data == 'string' ? JSON.parse(data).data : data.data;

    for (const cert of certificates) {
      const output = this.decode(cert.encrypt_certificate, this.wxApiV3Key);
      cert.decrypt_certificate = output.toString();
      const beginIndex = cert.decrypt_certificate.indexOf('-\n');
      const endIndex = cert.decrypt_certificate.indexOf('\n-');
      const str = cert.decrypt_certificate.substring(beginIndex + 2, endIndex);
      const x509Certificate = new x509.X509Certificate(
        Buffer.from(str, 'base64'),
      );
      const public_key = Buffer.from(
        x509Certificate.publicKey.rawData,
      ).toString('base64');
      cert.public_key = `-----BEGIN PUBLIC KEY-----\n${public_key}\n-----END PUBLIC KEY-----`;
    }

    return (this.certificates = certificates);
  }

  async verifySign({ body, headers }, repeatVerify = true) {
    const timestamp = headers['wechatpay-timestamp'];
    const nonce = headers['wechatpay-nonce'];
    const serial = headers['wechatpay-serial'];
    const signature = headers['wechatpay-signature'];
    const data = `${timestamp}\n${nonce}\n${
      typeof body == 'string' ? body : JSON.stringify(body)
    }\n`;
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(Buffer.from(data));
    let verifySerialNoPass = false;
    for (const cert of this.certificates) {
      if (cert.serial_no === serial) {
        verifySerialNoPass = true;
        const flag = verify.verify(cert.public_key, signature, 'base64');
        console.log(flag);
        return flag;
      }
    }
    if (!verifySerialNoPass && repeatVerify) {
      await this.decodeCertificates();
      return await this.verifySign({ body, headers }, false);
    } else {
      ToolsService.fail('平台证书序列号不相符');
    }
  }

  // 获取平台证书列表
  async getCertificates(check = false) {
    const result = await this.run({ type: 'certificates' });
    const { data, headers, status } = result;

    if (check && status == 200) {
      const body = JSON.parse(JSON.stringify(data));
      await this.verifySign({
        headers,
        body,
      });
    }

    return result;
  }

  // jsApi统一下单
  async jsApi(params) {
    const bodyParams = {
      ...params,
      appid: this.appId,
      mchid: this.mchId,
      description: this.description,
    };
    return await this.run({ bodyParams, type: 'jsApi' });
  }
}
