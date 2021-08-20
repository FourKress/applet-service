import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  async code2Session(code): Promise<string> {
    const params = `appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await this.httpService
      .get(`https://api.weixin.qq.com/sns/jscode2session?${params}`)
      .toPromise();
    return res.data;
  }

  async getActivityId(): Promise<string> {
    const params = `grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
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
