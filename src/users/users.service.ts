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

  async findOne(username: string, password: string): Promise<any> {
    const data = await this.usersRepository.findOne({
      password,
    });
    console.log(data, '12');
    return data;
  }

  async create(createUser: User): Promise<any> {
    console.log(createUser);
    return this.usersRepository.save(createUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
