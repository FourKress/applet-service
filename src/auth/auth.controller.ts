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
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @NoAuth()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Request() req,
    @Body() user: UserInterface,
  ): Promise<IResponse> {
    try {
      const loginInfo = await this.authService.login(user);
      return new ResponseSuccess('LOGIN.SUCCESS', loginInfo);
    } catch (error) {
      return new ResponseError('LOGIN.ERROR', error);
    }
  }
}
