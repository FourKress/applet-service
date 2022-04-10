import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';

import { WithdrawService } from './withdraw.service';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async handleWithdraw(
    @Request() req,
    @Body('amount') amount: number,
  ): Promise<any> {
    const tokenInfo: UserEntity = req.user;
    return await this.withdrawService.handleWithdraw(tokenInfo, amount);
  }
}
