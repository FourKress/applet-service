import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';

import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(openId: string): Promise<any> {
    const user = await this.usersService.findOne(openId);
    if (user && user.openId === openId) {
      return user;
    }
    return null;
  }

  async login(user: any): Promise<any> {
    const { openId } = user;

    const targetUser = await this.validateUser(openId);

    if (targetUser) {
      console.log(99, targetUser);
      return {
        msg: '',
        code: 10000,
        data: {
          token: this.jwtService.sign({ openId, sub: targetUser.id }),
          userInfo: targetUser,
        },
      };
    } else {
      const userInfo = await this.usersService.create(user);
      console.log(88, userInfo);
      return {
        msg: '',
        code: 10000,
        data: {
          token: this.jwtService.sign({ openId, sub: userInfo.id }),
          userInfo,
        },
      };
    }
  }
}
