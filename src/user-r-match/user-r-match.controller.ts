import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { UserRMatchService } from './user-r-match.service';
import { UserRMatch } from './user-r-match.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('userRMatch')
export class UserRMatchController {
  constructor(private readonly userRMatchService: UserRMatchService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addRelation(@Body() params: UserRMatch) {
    console.log(params);
    return this.userRMatchService.addRelation(params);
  }

  @Get('findAllByMatchId')
  async findAllByMatchId(@Query() params) {
    const list = await this.userRMatchService.findAllByMatchId(params.matchId);
    if (!list) {
      return {
        msg: '人员信息获取失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: list,
      code: 10000,
    };
  }
}
