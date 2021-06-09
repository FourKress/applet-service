import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    console.log(123);
    return req.user;
  }

  // @UseGuards(AuthGuard('custom'))
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }

  @Get('get')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('post')
  getPost(): string {
    return '231';
  }
}
