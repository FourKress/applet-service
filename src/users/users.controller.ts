import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('findAll')
  async findAll(): Promise<any> {
    const users = await this.usersService.findAll();
    if (!users) {
      return {
        msg: '获取用户信息失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: users,
      code: 10000,
    };
  }

  @Get('findOneByOpenId')
  async findOneByOpenId(@Query() userInfo: any): Promise<any> {
    console.log(userInfo, '查询');
    const user = await this.usersService.findOneByOpenId(userInfo.openId);
    if (!user) {
      return {
        msg: '',
        data: null,
        code: 10000,
      };
    }
    return {
      msg: '',
      data: user,
      code: 10000,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('findOneById')
  async findOneById(@Request() req): Promise<any> {
    const {
      user: { userId },
    } = req;
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      return {
        msg: '获取用户信息失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: user,
      code: 10000,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('modify')
  @HttpCode(200)
  async modify(@Request() req, @Body() modifyUser: User) {
    const {
      user: { id },
    } = req;
    const user = await this.usersService.modify({
      ...modifyUser,
      id,
    });
    if (!user) {
      return {
        msg: '用户信息修改失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: user,
      code: 10000,
    };
  }
}
