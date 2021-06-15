import { Injectable, HttpService } from '@nestjs/common';
import { appId, appSecret } from './wx.config';

@Injectable()
export class WxService {
  constructor(private readonly httpService: HttpService) {}

  async code2Session(code) {
    const params = `appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.httpService
      .get(`https://api.weixin.qq.com/sns/jscode2session?${params}`)
      .toPromise();
    console.log(res.data);
    return {
      msg: '',
      code: 10000,
      data: res.data,
    };
  }
}
