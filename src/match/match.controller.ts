import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ModifyMatchDto } from './dto/modify-match.dto';
import { MatchRunDto } from './dto/match-run.dto';
import { Match } from './schemas/match.schema';
import { MatchSpaceInterface } from './interfaces/match-space.interface';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';
import { NoAuth } from '../common/decorators/no-auth.decorator';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { ToolsService } from '../common/utils/tools-service';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @NoAuth()
  @Post('info')
  @HttpCode(HttpStatus.OK)
  async findBySpaceId(@Body() params: any): Promise<MatchSpaceInterface[]> {
    return await this.matchService.findBySpaceId(params);
  }

  @Get('list')
  async findByStadium(
    @Query('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Match[]> {
    return await this.matchService.findByStadiumId(
      {
        stadiumId,
      },
      'lt',
    );
  }

  @Get('failList')
  async findByStadiumFail(
    @Query('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Match[]> {
    return await this.matchService.findByStadiumId(
      {
        stadiumId,
      },
      'gt',
    );
  }

  @Post('runList')
  @HttpCode(HttpStatus.OK)
  async findByRunData(@Body() params: MatchRunDto): Promise<Match[]> {
    const { stadiumId } = params;
    if (!stadiumId) {
      ToolsService.fail('请先到个人中心完善场馆相关设置');
      return;
    }
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
  ): Promise<MatchSpaceInterface> {
    return await this.matchService.details(id);
  }

  @NoAuth()
  @Get('repeatModelEnum')
  repeatModelEnum() {
    return this.matchService.repeatModelEnum();
  }

  @NoAuth()
  @Get('weekEnum')
  weekEnum() {
    return this.matchService.weekEnum();
  }

  @Get('cancel')
  async cancel(@Query('id', new ValidationIDPipe()) id: string): Promise<any> {
    return await this.matchService.cancel(id);
  }

  @Get('waitStartList')
  async waitStartList(@Request() req): Promise<any[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.matchService.findWaitStartList(tokenInfo.userId);
  }

  @Get('getToDayRevenue')
  async getToDayRevenue(@Query('runDate') runDate: string): Promise<any[]> {
    return await this.matchService.getToDayRevenue(runDate);
  }
}
