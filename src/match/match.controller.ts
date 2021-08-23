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
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchInterface } from './interfaces/match.interface';
import { MatchDto } from './dto/match.dto';
import { MatchSpaceDto } from './dto/match-space.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  async findById(@Query() params: MatchInterface): Promise<MatchSpaceDto[]> {
    return await this.matchService.findBySpaceId(params.spaceId);
  }

  @Post('add')
  async addMatch(@Body() params: CreateMatchDto): Promise<MatchInterface> {
    return await this.matchService.addMatch(params);
  }

  @Post('orderMatchInfo')
  @HttpCode(HttpStatus.OK)
  async findOrderMatch(@Body() params): Promise<MatchInterface> {
    return await this.matchService.findById(params.matchId);
  }
}
