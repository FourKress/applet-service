import {
  Controller,
  Post,
  Request,
  UseGuards,
  Body,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(@Body() req) {
    const loginInfo = await this.authService.login(req);
    if (!loginInfo) {
      return {
        msg: '微信快捷登录失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: loginInfo,
      code: 10000,
    };
  }
}
