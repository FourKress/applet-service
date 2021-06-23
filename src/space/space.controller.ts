import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { Space } from './space.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  @HttpCode(200)
  async addSpace(@Body() params: Space) {
    const space = await this.spaceService.addSpace(params);
    if (!space) {
      return {
        msg: '添加场次失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: space,
      code: 10000,
    };
  }

  @Post('list')
  @HttpCode(200)
  async findByStadium(@Body() params: Space) {
    const spaces = await this.spaceService.findByStadiumId(params);
    if (!spaces) {
      return {
        msg: '获取球场场次失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: spaces,
      code: 10000,
    };
  }
}
