import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema';
import { StadiumService } from '../stadium/stadium.service';
import { User } from '../users/schemas/user.schema';

const Moment = require('moment');

@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
    @InjectModel(Manager.name)
    private readonly managerModel: Model<ManagerDocument>,
    private readonly stadiumService: StadiumService,
  ) {}

  async authManager(params, userId): Promise<any> {
    const { stadiumId, bossId, expiredTime, inviteId, inviteUserId } = params;
    this.stadiumService.deleteInvite(inviteId);
    if (Moment().diff(expiredTime) > 0) {
      return {
        error: true,
        msg: '管理员邀请已失效，请重新邀请！',
      };
    }

    if (inviteUserId === userId) {
      return {
        error: true,
        isAuth: true,
        msg: '您不能邀请自己成为管理员，请检查后再试！',
      };
    }
    const checkByDB = await this.managerModel.findOne({
      stadiumId,
      userId,
      validFlag: true,
    });
    if (checkByDB) {
      return {
        error: true,
        isAuth: true,
        msg: '您已是该球场的管理员，请不要重复接受邀请！',
      };
    }
    const manager = new this.managerModel({
      stadiumId,
      bossId,
      user: userId,
      validFlag: true,
    });
    return await manager.save();
  }

  async deleteManager(id: string): Promise<any> {
    await this.managerModel.findByIdAndUpdate(id, {
      validFlag: false,
    });
  }

  async getManagerList(stadiumId: string): Promise<Manager[]> {
    return await this.managerModel
      .find({
        stadiumId,
        validFlag: true,
      })
      .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
      .exec();
  }
}
