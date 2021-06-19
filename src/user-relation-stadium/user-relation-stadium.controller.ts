import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRelationStadiumService } from './user-relation-stadium.service';
import { UserRelationStadium } from './user-relation-stadium.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('userRelationStadium')
export class UserRelationStadiumController {
  constructor(
    private readonly userRelationStadiumService: UserRelationStadiumService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('watchList')
  async watchList(@Query() params: UserRelationStadium) {
    const relation = await this.userRelationStadiumService.watchListByUserId(
      params.userId,
    );
    if (!relation) {
      return {
        msg: '获取球场关注列表失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: relation,
      code: 10000,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('watchFlag')
  @HttpCode(200)
  async watchFlag(@Body() data: UserRelationStadium) {
    const relation = await this.userRelationStadiumService.watchFlag(data);
    if (!relation) {
      return {
        msg: '获取球场关注失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: relation,
      code: 10000,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('watch')
  @HttpCode(200)
  async watch(@Body() watchRelation: UserRelationStadium) {
    const relation = await this.userRelationStadiumService.watch(watchRelation);
    return {
      msg: '',
      data: relation,
      code: 10000,
    };
  }
}
