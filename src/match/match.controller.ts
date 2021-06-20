import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  async findById(@Query() params) {
    const matchList = await this.matchService.findBySpaceId(params.spaceId);
    if (!matchList) {
      return {
        msg: '场次信息获取失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: matchList,
      code: 10000,
    };
  }

  @Post('add')
  async addMatch(@Body() params) {
    const match = await this.matchService.addMatch(params);
    if (!match) {
      return {
        msg: '场次添加失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: match,
      code: 10000,
    };
  }
}
