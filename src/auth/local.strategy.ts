import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { promisify } from 'util';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // super({
    //   passReqToCallback: true,
    // });
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      // 如果用户名密码不匹配，清理session
      // req.logout();
      // return {
      //   msg: '密码错误',
      //   code: 300,
      //   data: user,
      //   status: 'error',
      // };
      throw new UnauthorizedException();
    }
    // 用户名密码匹配，设置session
    // promisify，统一代码风格，将node式callback转化为promise
    // await promisify(req.login.bind(req))(user);
    return user;
  }
}
