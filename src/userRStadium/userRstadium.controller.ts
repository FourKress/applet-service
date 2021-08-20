import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { UserRStadiumService } from './userRstadium.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { UserRStadiumDto } from './dto/userRStadium.dto';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { UserRStadiumInterface } from './interfaces/userRStadium.interface';
import { CreateUserRStadiumDto } from './dto/create-userRStadium.dto';

@Controller('userRStadium')
export class UserRStadiumController {
  constructor(private readonly userRStadiumService: UserRStadiumService) {}

  @Get('watchList')
  async watchList(@Request() req): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;

    try {
      const list = await this.userRStadiumService.watchListByUserId(
        tokenInfo.userId,
      );
      return new ResponseSuccess('COMMON.SUCCESS', list);
    } catch {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
    }
  }

  @Post('watchFlag')
  @HttpCode(HttpStatus.OK)
  async watchFlag(@Request() req, @Body() data: any): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;

    try {
      const relation = await this.userRStadiumService.watchFlag(
        data.stadiumId,
        tokenInfo.userId,
      );
      return new ResponseSuccess(
        'COMMON.SUCCESS',
        new UserRStadiumDto(relation),
      );
    } catch {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
    }
  }

  @Post('watch')
  @HttpCode(HttpStatus.OK)
  async watch(
    @Request() req,
    @Body() watchRelation: CreateUserRStadiumDto | UserRStadiumInterface,
  ): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;

    try {
      const relation = await this.userRStadiumService.watch({
        ...watchRelation,
        userId: tokenInfo.userId,
      });
      return new ResponseSuccess('COMMON.SUCCESS', relation);
    } catch {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
    }
  }
}
