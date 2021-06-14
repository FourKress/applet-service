import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(@Body() createUser: User) {
    await this.usersService.create(createUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('findAll')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('findOne')
  async findOne(@Body() userInfo: any): Promise<User> {
    console.log(userInfo, '查询');
    return this.usersService.findOne(userInfo.username, userInfo.password);
  }
}
