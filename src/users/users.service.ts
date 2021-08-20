import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserInterface } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
  ) {}

  async findOneByOpenId(openId: string): Promise<UserInterface> {
    if (!openId) {
      return null;
    }
    return await this.userModel
      .findOne({
        openId,
      })
      .exec();
  }

  async findOneById(id: string): Promise<UserInterface> {
    if (!id) {
      return null;
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
