import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(openId: string): Promise<any> {
    const data = await this.usersRepository.findOne({
      openId,
    });
    return data;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(createUser: User): Promise<any> {
    return this.usersRepository.save(createUser).then((user) => {
      return user;
    });
  }

  async modify(modifyUser: User): Promise<any> {
    const { id, ...userInfo } = modifyUser;
    return this.usersRepository.update(id, userInfo).then((user) => {
      return {
        msg: '',
        data: user,
        code: 10000,
      };
    });
  }
}
