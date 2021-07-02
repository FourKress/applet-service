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
    return res.data;
  }

  async getActivityId() {
    const params = `grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const accessToken = (
      await this.httpService
        .get(`https://api.weixin.qq.com/cgi-bin/token?${params}`)
        .toPromise()
    ).data?.access_token;
    const activityId = (
      await this.httpService
        .get(
          `https://api.weixin.qq.com/cgi-bin/message/wxopen/activityid/create?access_token=${accessToken}`,
        )
        .toPromise()
    ).data?.activity_id;
    return activityId;
  }
}
