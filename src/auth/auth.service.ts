import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';
import { TokenEntity } from './token.entity';

import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username, password);
    console.log(username, password, user, 333);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<TokenEntity> {
    const { id, username } = user;
    return {
      token: this.jwtService.sign({ username, sub: id }),
    };
  }
}
