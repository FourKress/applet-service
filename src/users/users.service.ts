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

  async findOneByOpenId(openId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      openId,
    });
    return user;
  }

  async findOneById(id: any): Promise<any> {
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
    await this.usersRepository.update(id, userInfo);
    const user = await this.findOneById(id);
    return user;
  }
}
