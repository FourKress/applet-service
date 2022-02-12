import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { JWTService } from './jwt.service';
import { AuthInterface } from './interfaces/auth.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JWTService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: CreateUserDto): Promise<AuthInterface> {
    const { openId } = user;
    let userFromDb: any = await this.usersService.findOneByOpenId(openId);
    if (!userFromDb) {
      userFromDb = await this.usersService.create(user);
    }
    const userInfo = userFromDb.toJSON();
    const token = await this.jwtService.createToken({
      userId: userInfo.id,
      openId: userInfo.openId,
      bossId: userInfo.bossId,
    });
    return {
      token,
      userInfo: userInfo,
    };
  }

  async adminLogin(params): Promise<AuthInterface> {
    const userFromDb: any = await this.usersService.findOneByPhoneNum(params);
    if (!userFromDb) {
      ToolsService.fail('账号或密码错误！');
    }
    const userInfo = userFromDb.toJSON();
    const token = await this.jwtService.createToken({
      userId: userInfo.id,
      openId: userInfo.openId,
      bossId: userInfo.bossId,
    });
    return {
      token,
      userInfo: userInfo,
    };
  }
}
