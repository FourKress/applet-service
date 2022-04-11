import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Withdraw, WithdrawDocument } from './schemas/withdraw.schema';

import { WxService } from '../wx/wx.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);
  constructor(
    @InjectModel(Withdraw.name)
    private readonly withdrawModel: Model<WithdrawDocument>,
    private readonly wxService: WxService,
    private readonly usersService: UsersService,
  ) {}

  async handleWithdraw(tokenInfo: UserEntity, amount: number): Promise<any> {
    const { openId, bossId, userId } = tokenInfo;
    const withdraw = new this.withdrawModel({ userId, bossId, amount });
    await withdraw.save();
    const withdrawId = withdraw._id;
    const wxResult = await this.wxService.handleWithdraw({
      amount,
      openId,
      withdrawId,
    });
    const { status, ...result } = wxResult;
    this.logger.log(result);
    await this.withdrawModel.findByIdAndUpdate(withdrawId, {
      ...wxResult,
    });
    if (status) {
      const userFormDB = await this.usersService.findByBossId(bossId);
      const { balanceAmt } = userFormDB;

      this.logger.log(`${balanceAmt}, ${amount}`);
      await this.usersService.modify({
        id: userId,
        balanceAmt: balanceAmt - amount,
      });

      return true;
    } else {
      return ToolsService.fail('微信提现失败');
    }
  }
}
