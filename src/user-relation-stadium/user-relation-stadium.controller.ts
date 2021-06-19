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
  async watchList(@Request() req) {
    const {
      user: { userId },
    } = req;
    const relation = await this.userRelationStadiumService.watchListByUserId(
      userId,
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
  async watchFlag(@Request() req, @Body() data: UserRelationStadium) {
    const {
      user: { userId },
    } = req;
    const relation = await this.userRelationStadiumService.watchFlag({
      ...data,
      userId,
    });
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
  async watch(@Request() req, @Body() watchRelation: UserRelationStadium) {
    const {
      user: { userId },
    } = req;
    const relation = await this.userRelationStadiumService.watch({
      ...watchRelation,
      userId,
    });
    return {
      msg: '',
      data: relation,
      code: 10000,
    };
  }
}
