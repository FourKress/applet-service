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
import { UsersService } from './users.service';
import { UserInterface } from './interfaces/user.interface';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('findAll')
  async findAll(): Promise<UserInterface[]> {
    return await this.usersService.findAll();
  }

  @NoAuth()
  @Get('findOneByOpenId')
  async findOneByOpenId(
    @Query() userInfo: UserInterface,
  ): Promise<UserInterface> {
    return await this.usersService.findOneByOpenId(userInfo.openId);
  }

  @Get('findOneById')
  async findOneById(@Request() req): Promise<UserInterface> {
    const tokenInfo: UserEntity = req.user;
    return await this.usersService.findOneById(tokenInfo.userId);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(
    @Request() req,
    @Body() modifyUser: UserInterface,
  ): Promise<UserInterface> {
    const tokenInfo: UserEntity = req.user;
    return await this.usersService.modify(
      Object.assign({}, modifyUser, {
        id: tokenInfo.userId,
      }),
    );
  }

  @Post('setBoss')
  @HttpCode(HttpStatus.OK)
  async setBoss(@Body() params: UserDto): Promise<UserInterface> {
    return await this.usersService.setBoss(params.id);
  }
}
