import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
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
  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
