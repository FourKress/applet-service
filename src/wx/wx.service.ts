import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

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
}
