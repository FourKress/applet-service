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
import { Match } from './schemas/match.schema';
import { MatchSpaceInterface } from './interfaces/match-space.interface';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  async findById(
    @Query('spaceId', new ValidationIDPipe()) spaceId: string,
  ): Promise<MatchSpaceInterface[]> {
    return await this.matchService.findBySpaceId(spaceId);
  }

  @Post('add')
  async addMatch(@Body() params: CreateMatchDto): Promise<Match> {
    return await this.matchService.addMatch(params);
  }

  @Post('orderMatchInfo')
  @HttpCode(HttpStatus.OK)
  async findOrderMatch(@Body() params): Promise<Match> {
    return await this.matchService.findById(params.matchId);
  }
}
