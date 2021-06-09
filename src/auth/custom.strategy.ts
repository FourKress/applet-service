import { Injectable, Request, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy) {
  async validate(@Request() req): Promise<any> {
    // TODO 纯演示
    const {
      passport: { user },
    } = req.session;

    if (!user) {
      throw new UnauthorizedException();
    }

    // 这里的userId和username是上面local.strategy在调用login()函数的时候，passport添加到session中的。
    // 数据结构保持一致即可
    const { userId, username } = user;
    return {
      userId,
      username,
    };
  }
}
