import { Controller, Get, Post, Body, Query, HttpCode } from '@nestjs/common';
import { MatchService } from './match.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchInterface } from './interfaces/match.interface';
import { MatchDto } from './dto/match.dto';
import { MatchSpaceDto } from './dto/match-space.dto';
import { SpaceDto } from '../space/dto/space.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  async findById(@Query() params: MatchInterface): Promise<IResponse> {
    const matchList = await this.matchService.findBySpaceId(params.spaceId);
    if (matchList) {
      return new ResponseSuccess('COMMON.SUCCESS', matchList);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('add')
  async addMatch(@Body() params: MatchInterface): Promise<IResponse> {
    const match = await this.matchService.addMatch(params);
    if (match) {
      return new ResponseSuccess('COMMON.SUCCESS', new MatchDto(match));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('orderMatchInfo')
  @HttpCode(200)
  async findOrderMatch(@Body() params): Promise<IResponse> {
    const match = await this.matchService.findById(params.matchId);
    if (match) {
      return new ResponseSuccess('COMMON.SUCCESS', new MatchDto(match));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
