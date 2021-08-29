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
import { ModifyMatchDto } from './dto/modify-match.dto';
import { MatchRunDto } from './dto/match-run.dto';
import { Match } from './schemas/match.schema';
import { MatchSpaceInterface } from './interfaces/match-space.interface';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  async findBySpaceId(
    @Query('spaceId', new ValidationIDPipe()) spaceId: string,
  ): Promise<MatchSpaceInterface[]> {
    return await this.matchService.findBySpaceId(spaceId);
  }

  @Get('list')
  async findByStadium(
    @Query('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Match[]> {
    return await this.matchService.findByStadiumId(stadiumId);
  }

  @Get('failList')
  async findByStadiumFail(
    @Query('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Match[]> {
    return await this.matchService.findByStadiumId(stadiumId, 'gt');
  }

  @Post('runList')
  @HttpCode(HttpStatus.OK)
  async findByRunData(@Body() params: MatchRunDto): Promise<Match[]> {
    return await this.matchService.findByRunData(params);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addMatch(@Body() params: CreateMatchDto): Promise<Match> {
    return await this.matchService.addMatch(params);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(@Body() params: ModifyMatchDto): Promise<Match> {
    return await this.matchService.modifyMatch(params);
  }

  @Get('details')
  async details(
    @Query('id', new ValidationIDPipe()) id: string,
  ): Promise<Match> {
    return await this.matchService.findById(id);
  }

  @Get('repeatModelEnum')
  repeatModelEnum() {
    return this.matchService.repeatModelEnum();
  }

  @Get('weekEnum')
  weekEnum() {
    return this.matchService.weekEnum();
  }
}
