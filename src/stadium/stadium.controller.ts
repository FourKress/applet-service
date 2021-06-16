import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StadiumService } from './stadium.service';
import { Stadium } from './stadium.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Get()
  async info() {
    return 'test';
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('modify')
  @HttpCode(200)
  async modify(@Body() modifyStadium: Stadium) {
    const user = await this.stadiumService.modify(modifyStadium);
    if (!user) {
      return {
        msg: '球场信息修改失败!',
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
  @Post('add')
  @HttpCode(200)
  async add(@Body() addStadium: Stadium) {
    console.log(addStadium);
    const stadium = await this.stadiumService.add(addStadium);
    if (!stadium) {
      return {
        msg: '球场添加失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: stadium,
      code: 10000,
    };
  }
}
