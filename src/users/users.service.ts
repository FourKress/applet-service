import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { ModifyUserDto } from './dto/modify-user.dto';
import { ToolsService } from '../common/utils/tools-service';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOneByOpenId(openId: string): Promise<User> {
    if (!openId) {
      ToolsService.fail('openId不能为空！');
    }
    return await this.userModel
      .findOne({
        openId,
      })
      .exec();
  }

  async findOneById(id: string): Promise<User> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(createUser: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUser);
    Object.assign(newUser, {
      teamUpCount: 0,
      monthlyCardCount: 0,
      isBoss: false,
    });
    return await newUser.save();
  }

  async modify(modifyUser: ModifyUserDto): Promise<User> {
    const { id, ...userInfo } = modifyUser;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }

    return await this.userModel.findByIdAndUpdate(id, userInfo).exec();
  }

  async setBoss(id: string): Promise<User> {
    const hasBoss = await this.userModel.findById(id);
    const { isBoss, phoneNum } = hasBoss;
    if (isBoss || hasBoss.bossId) {
      ToolsService.fail('设置失败，该账号已是场主身份！');
    }
    const bossId = Types.ObjectId().toHexString();
    const bossPhoneNum = phoneNum || '';
    return await this.userModel
      .findByIdAndUpdate(id, {
        isBoss: true,
        bossId,
        bossPhoneNum,
      })
      .exec();
  }

  async findByBossId(bossId: string): Promise<User> {
    if (!bossId) {
      ToolsService.fail('bossId不能为空！');
    }
    return await this.userModel.findOne({ bossId }).exec();
  }

  async setBossBalanceAmt(params): Promise<any> {
    const { bossId, ...data } = params;
    await this.userModel
      .findOneAndUpdate(
        {
          bossId,
        },
        {
          $set: data,
        },
      )
      .exec();
  }
}
