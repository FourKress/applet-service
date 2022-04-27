import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Withdraw, WithdrawDocument } from './schemas/withdraw.schema';

import { WxService } from '../wx/wx.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { ToolsService } from '../common/utils/tools-service';
import * as currency from 'currency.js';
const Moment = require('moment');

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);
  constructor(
    @InjectModel(Withdraw.name)
    private readonly withdrawModel: Model<WithdrawDocument>,
    private readonly wxService: WxService,
    private readonly usersService: UsersService,
  ) {}

  async handleWithdraw(
    tokenInfo: UserEntity,
    withdrawAmt: number,
  ): Promise<any> {
    const { openId, bossId, userId } = tokenInfo;
    const oldWithdrawList = await this.withdrawModel
      .find({ userId, bossId })
      .where('createdAt')
      .gte(Moment().startOf('day').valueOf());
    if (oldWithdrawList?.length >= 10) {
      ToolsService.fail('单日提现次数不能超过10次');
      return;
    }
    const amt = oldWithdrawList.reduce(
      (sum, curr) => currency(sum).add(curr.withdrawAmt).value,
      0,
    );
    if (amt >= 2000) {
      ToolsService.fail('单日、单次提现金额不能超过2000元');
      return;
    }
    const withdraw = new this.withdrawModel({
      userId,
      bossId,
      withdrawAmt,
      createdMonthAt: Moment().startOf('month').valueOf(),
    });
    await withdraw.save();
    const withdrawId = withdraw._id;
    const wxResult = await this.wxService.handleWithdraw({
      withdrawAmt,
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

      this.logger.log(`${balanceAmt}, ${withdrawAmt}`);
      await this.usersService.modify({
        id: userId,
        balanceAmt: balanceAmt - withdrawAmt,
      });

      return true;
    } else {
      return ToolsService.fail('微信提现失败');
    }
  }

  async getRecordsList(bossId): Promise<any[]> {
    const list = await this.withdrawModel
      .find({
        bossId,
      })
      .sort({ createdAt: 'desc' })
      .exec();
    const records = [];
    list.forEach((d) => {
      const target = records.find((r) => r?.monthTime === d.createdMonthAt);
      const withdraw = {
        ...d.toJSON(),
        time: Moment(d.createdAt).format('MM月DD日 HH:mm'),
      };
      if (!records?.length || !target) {
        records.push({
          monthName: Moment(d.createdMonthAt).format('YYYY年MM月'),
          monthTime: d.createdMonthAt,
          list: [withdraw],
          totalAmt: d.withdrawAmt,
        });
      } else {
        target.list.push(withdraw);
        target.totalAmt = target.list.reduce(
          (sum, curr) => currency(sum).add(curr.withdrawAmt).value,
          0,
        );
      }
    });

    return records;
  }
}
