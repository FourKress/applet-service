import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

// export type User = any;

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  private readonly users = [
    {
      userId: 1,
      username: 'test1',
      password: 'testPwd1',
    },
    {
      userId: 2,
      username: 'test2',
      password: 'testPwd2',
    },
  ];

  // TODO 纯演示
  async findOne(username: string): Promise<any> {
    return this.users.find((user) => user.username === username);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
