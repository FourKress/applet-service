import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
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
    @Body('withdrawAmt') withdrawAmt: number,
  ): Promise<any> {
    const tokenInfo: UserEntity = req.user;
    return await this.withdrawService.handleWithdraw(tokenInfo, withdrawAmt);
  }

  @Get('records')
  @HttpCode(HttpStatus.OK)
  async getRecordsList(@Request() req): Promise<any[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.withdrawService.getRecordsList(tokenInfo.bossId);
  }
}
