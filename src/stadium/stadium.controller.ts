import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StadiumService } from './stadium.service';
import { Stadium } from './stadium.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async findAll(): Promise<any> {
    const stadium = await this.stadiumService.findAll();
    if (!stadium) {
      return {
        msg: '获取球场信息列表失败!',
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

  @Get('info')
  async info(@Query() params: any) {
    console.log(params);
    const stadium = await this.stadiumService.findById(params.id);
    if (!stadium) {
      return {
        msg: '球场信息获取失败!',
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

  @UseGuards(AuthGuard('jwt'))
  @Post('modify')
  @HttpCode(200)
  async modify(@Body() modifyStadium: Stadium) {
    const stadium = await this.stadiumService.modify(modifyStadium);
    if (!stadium) {
      return {
        msg: '球场信息修改失败!',
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
