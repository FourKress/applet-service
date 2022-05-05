import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { UsersModule } from '../users/users.module';
import { WxModule } from '../wx/wx.module';
import { Withdraw, WithdrawSchema } from './schemas/withdraw.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Withdraw.name, schema: WithdrawSchema },
    ]),
    UsersModule,
    WxModule,
  ],
  providers: [WithdrawService],
  controllers: [WithdrawController],
})
export class WithdrawModule {}
