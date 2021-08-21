import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { UserRMatchService } from './userRMatch.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { UserRMatchDto } from './dto/userRMatch.dto';
import { UserRMatchInterface } from './interfaces/userRMatch.interface';

@Controller('userRMatch')
export class UserRMatchController {
  constructor(private readonly userRMatchService: UserRMatchService) {}

  @Post('add')
  async addRelation(@Body() params: CreateUserRMatchDto): Promise<IResponse> {
    const userRMatch = await this.userRMatchService.addRelation(params);
    if (userRMatch) {
      return new ResponseSuccess(
        'COMMON.SUCCESS',
        new UserRMatchDto(userRMatch),
      );
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Get('findAllByMatchId')
  async findAllByMatchId(
    @Query() params: UserRMatchInterface,
  ): Promise<IResponse> {
    const list = await this.userRMatchService.findAllByMatchId(params.matchId);
    if (list) {
      return new ResponseSuccess('COMMON.SUCCESS', list);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
