import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserInterface } from './interfaces/user.interface';
import { ToolsService } from '../common/interfaces/tools-service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
  ) {}

  async findOneByOpenId(openId: string): Promise<UserInterface> {
    if (!openId) {
      ToolsService.fail('openId不能为空！');
    }
    return await this.userModel
      .findOne({
        openId,
      })
      .exec();
  }

  async findOneById(id: string): Promise<UserInterface> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.userModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();
  }

  async findAll(): Promise<UserInterface[]> {
    return this.userModel.find().exec();
  }

  async create(createUser: CreateUserDto): Promise<UserInterface> {
    const newUser = new this.userModel(createUser);
    Object.assign(newUser, {
      teamUpCount: 0,
      monthlyCardCount: 0,
      isBoss: false,
    });
    return await newUser.save();
  }

  async modify(modifyUser: UserInterface): Promise<UserInterface> {
    const { id, ...userInfo } = modifyUser;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }

    return await this.userModel.findByIdAndUpdate(id, userInfo).exec();
  }

  async setBoss(id: string): Promise<UserInterface> {
    const hasBoss = await this.userModel.findById(id);
    if (hasBoss.isBoss || hasBoss.bossId) {
      ToolsService.fail('设置失败，该账号已是场主身份！');
    }
    const bossId = Types.ObjectId().toHexString();
    return await this.userModel
      .findByIdAndUpdate(id, {
        isBoss: true,
        bossId,
      })
      .exec();
  }
}
