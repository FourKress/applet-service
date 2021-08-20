import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { JWTService } from './jwt.service';
import { UserInterface } from '../users/interfaces/user.interface';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserInterface>,
    private readonly jwtService: JWTService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: UserInterface): Promise<any> {
    const { openId } = user;
    let userFromDb = await this.usersService.findOneByOpenId(openId);
    if (!userFromDb) {
      userFromDb = await this.usersService.create(user);
    }
    const token = await this.jwtService.createToken({
      userId: userFromDb._id,
      openId: userFromDb.openId,
      isBoss: userFromDb.isBoss,
    });
    return {
      token,
      userInfo: new UserDto(userFromDb),
    };
  }
}
