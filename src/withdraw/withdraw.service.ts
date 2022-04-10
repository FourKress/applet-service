import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Withdraw, WithdrawDocument } from './schemas/withdraw.schema';

import { WxService } from '../wx/wx.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectModel(Withdraw.name)
    private readonly withdrawModel: Model<WithdrawDocument>,
    private readonly wxService: WxService,
    private readonly usersService: UsersService,
  ) {}

  async handleWithdraw(tokenInfo: UserEntity, amount: number): Promise<any> {
    const { openId, bossId, userId } = tokenInfo;
    const userFormDB = await this.usersService.findByBossId(bossId);
    const { balanceAmt } = userFormDB;
    console.log(balanceAmt);
    const withdraw = new this.withdrawModel({ userId, bossId, amount });
    console.log(withdraw);
    return await this.wxService.handleWithdraw({
      amount,
      openId,
      withdrawId: withdraw._id,
    });
  }
}
