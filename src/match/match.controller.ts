import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchInterface } from './interfaces/match.interface';
import { MatchDto } from './dto/match.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  async findById(@Query() params: MatchInterface): Promise<IResponse> {
    const matchList = await this.matchService.findBySpaceId(params.spaceId);
    return new ResponseSuccess(matchList);
  }

  @Post('add')
  async addMatch(@Body() params: CreateMatchDto): Promise<IResponse> {
    const match = await this.matchService.addMatch(params);
    return new ResponseSuccess(new MatchDto(match));
  }

  @Post('orderMatchInfo')
  @HttpCode(HttpStatus.OK)
  async findOrderMatch(@Body() params): Promise<IResponse> {
    const match = await this.matchService.findById(params.matchId);
    return new ResponseSuccess(new MatchDto(match));
  }
}
