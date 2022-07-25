import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { JWTService } from './jwt.service';
import { AuthInterface } from './interfaces/auth.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ToolsService } from '../common/utils/tools-service';
import { ManagerService } from '../manager/manager.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JWTService,
    private readonly usersService: UsersService,
    private readonly managerService: ManagerService,
  ) {}

  async login(user: CreateUserDto): Promise<AuthInterface> {
    const { openId, nickName, avatarUrl } = user;
    let userFromDb: any = await this.usersService.findOneByOpenId(openId);
    if (!userFromDb) {
      userFromDb = await this.usersService.create(user);
    } else if (nickName && avatarUrl) {
      userFromDb = await this.usersService.modify({
        id: userFromDb._id,
        nickName,
        avatarUrl,
      });
    }
    const userInfo = userFromDb.toJSON();
    const managerList = await this.managerService.getManagerByUserId(
      userInfo.id,
    );
    const authIds = [];
    const authStadiumIds = [];
    (managerList ?? []).forEach((d) => {
      authIds.push(d.bossId);
      authStadiumIds.push(d.stadiumId);
    });
    const token = await this.jwtService.createToken({
      userId: userInfo.id,
      openId: userInfo.openId,
      bossId: userInfo.bossId,
      authIds,
      authStadiumIds,
    });
    return {
      token,
      authIds,
      authStadiumIds,
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
      authIds: [],
      authStadiumIds: [],
    });
    return {
      token,
      authIds: [],
      authStadiumIds: [],
      userInfo: userInfo,
    };
  }
}
