import {
  Controller,
  Request,
  HttpStatus,
  HttpCode,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserInterface } from '../users/interfaces/user.interface';
import { NoAuth } from '../common/decorators/no-auth.decorator';
import { AuthInterface } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @NoAuth()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Request() req,
    @Body() user: UserInterface,
  ): Promise<AuthInterface> {
    return await this.authService.login(user);
  }
}
