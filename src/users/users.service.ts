import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOneByOpenId(openId: string): Promise<any> {
    if (!openId) {
      return null;
    }
    const user = await this.usersRepository.findOne({
      openId,
    });
    return user;
  }

  async findOneById(id: string): Promise<any> {
    if (!id) {
      return null;
    }
    const user = await this.usersRepository.findOne(id);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(createUser: User): Promise<any> {
    const user = await this.usersRepository.save(createUser);
    return user;
  }

  async modify(modifyUser: User): Promise<any> {
    const { id, ...userInfo } = modifyUser;
    if (!id) {
      return null;
    }
    const target = await this.findOneById(id);
    const data = {
      ...target,
      ...userInfo,
      updateAt: Moment().format(),
    };
    const user = await this.usersRepository.save(data);
    return user;
  }
}
