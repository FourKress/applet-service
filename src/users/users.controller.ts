import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('findAll')
  async findAll(): Promise<IResponse> {
    const users = await this.usersService.findAll();
    if (users) {
      return new ResponseSuccess('COMMON.SUCCESS', users);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Get('findOneByOpenId')
  async findOneByOpenId(@Query() userInfo: UserDto): Promise<IResponse> {
    const user = await this.usersService.findOneByOpenId(userInfo.openId);
    if (user) {
      return new ResponseSuccess('COMMON.SUCCESS', user);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Get('findOneById')
  async findOneById(@Request() { user: tokenInfo }): Promise<IResponse> {
    const { userId } = tokenInfo;
    const user = await this.usersService.findOneById(userId);
    if (user) {
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(@Request() req, @Body() modifyUser: User): Promise<IResponse> {
    const user = await this.usersService.modify(modifyUser);
    if (user) {
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
