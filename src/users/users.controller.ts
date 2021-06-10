import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../schemas/user.schema';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    await this.usersService.create(createUserDto);
  }

  @Get('findAll')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('findOne')
  async findOne(@Param() _id: string): Promise<User> {
    console.log(_id);
    return this.usersService.findOne('60c2123b5386db39a4b4cdb6');
  }
}
