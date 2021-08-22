import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { UsersService } from './users.service';
import { UserInterface } from './interfaces/user.interface';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('findAll')
  async findAll(): Promise<IResponse> {
    const users = await this.usersService.findAll();
    return new ResponseSuccess(users);
  }

  @NoAuth()
  @Get('findOneByOpenId')
  async findOneByOpenId(@Query() userInfo: UserInterface): Promise<IResponse> {
    const user = await this.usersService.findOneByOpenId(userInfo.openId);
    return new ResponseSuccess(new UserDto(user));
  }

  @Get('findOneById')
  async findOneById(@Request() req): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const user = await this.usersService.findOneById(tokenInfo.userId);
    return new ResponseSuccess(new UserDto(user));
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(
    @Request() req,
    @Body() modifyUser: UserInterface,
  ): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const user = await this.usersService.modify(
      Object.assign({}, modifyUser, {
        id: tokenInfo.userId,
      }),
    );
    return new ResponseSuccess(new UserDto(user));
  }

  @Post('setBoss')
  @HttpCode(HttpStatus.OK)
  async setBoss(@Body() params: UserDto): Promise<IResponse> {
    const user = await this.usersService.setBoss(params.id);
    return new ResponseSuccess(new UserDto(user));
  }
}
