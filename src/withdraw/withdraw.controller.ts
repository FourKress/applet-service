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
  async getRecordsList(@Request() req): Promise<any[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.withdrawService.getRecordsList(tokenInfo.bossId);
  }

  @Post('adminRecords')
  @HttpCode(HttpStatus.OK)
  async getAdminRecordsList(@Body() params): Promise<any[]> {
    return await this.withdrawService.getAdminRecordsList(params);
  }

  @Get('config')
  async getWithdrawConfig(@Request() req): Promise<boolean> {
    const tokenInfo: UserEntity = req.user;
    return await this.withdrawService.getWithdrawConfig(tokenInfo.bossId);
  }
}
