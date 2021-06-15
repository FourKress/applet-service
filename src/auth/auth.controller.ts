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
    console.log(req, 123);
    return this.authService.login(req);
  }
}
