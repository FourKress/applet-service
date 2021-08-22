import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { UserRMatchService } from './userRMatch.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { UserRMatchDto } from './dto/userRMatch.dto';
import { UserRMatchInterface } from './interfaces/userRMatch.interface';

@Controller('userRMatch')
export class UserRMatchController {
  constructor(private readonly userRMatchService: UserRMatchService) {}

  @Post('add')
  async addRelation(@Body() params: CreateUserRMatchDto): Promise<IResponse> {
    const userRMatch = await this.userRMatchService.addRelation(params);
    return new ResponseSuccess(new UserRMatchDto(userRMatch));
  }

  @Get('findAllByMatchId')
  async findAllByMatchId(
    @Query() params: UserRMatchInterface,
  ): Promise<IResponse> {
    const list = await this.userRMatchService.findAllByMatchId(params.matchId);
    return new ResponseSuccess(list);
  }
}
