import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { User } from '../users/interfaces/user.interface';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './interfaces/user-entity.interface';

@Injectable()
export class JWTService {
  constructor(private readonly configService: ConfigService) {}

  async createToken(userInfo: UserEntity) {
    const expiresIn = this.configService.get('auth.expiresIn'),
      secretOrKey = this.configService.get('auth.secretOrKey');
    const token = jwt.sign(userInfo, secretOrKey, { expiresIn });

    return token;
  }

  async validateUser(signedUser): Promise<User | null> {
    if (signedUser) {
      return signedUser;
    }
    return null;
  }
}
