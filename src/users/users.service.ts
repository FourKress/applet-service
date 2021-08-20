import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async findOneByOpenId(openId: string): Promise<User> {
    if (!openId) {
      return null;
    }
    const user = await this.userModel
      .findOne({
        openId,
      })
      .exec();
    return user;
  }

  async findOneById(id: string): Promise<User> {
    if (!id) {
      return null;
    }
    const user = await this.userModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();
    return user;
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

  async modify(modifyUser: User): Promise<User> {
    const { id, ...userInfo } = modifyUser;
    if (!id) {
      return null;
    }
    return await this.userModel
      .findOneAndUpdate(
        { _id: Types.ObjectId(id) },
        {
          $set: userInfo,
        },
      )
      .exec();
  }
}
