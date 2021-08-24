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
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { CreateUserRStadiumDto } from './dto/create-userRStadium.dto';
import { ModifyUserRStadiumDto } from './dto/modify-userRStadium.dto';
import { UserRStadium } from './schemas/userRStadium.schema';

@Controller('userRStadium')
export class UserRStadiumController {
  constructor(private readonly userRStadiumService: UserRStadiumService) {}

  @Get('watchList')
  async watchList(@Request() req): Promise<UserRStadium[]> {
    const tokenInfo: UserEntity = req.user;

    return await this.userRStadiumService.watchListByUserId(tokenInfo.userId);
  }

  @Post('watchFlag')
  @HttpCode(HttpStatus.OK)
  async watchFlag(@Request() req, @Body() data: any): Promise<UserRStadium> {
    const tokenInfo: UserEntity = req.user;

    return await this.userRStadiumService.watchFlag(
      data.stadiumId,
      tokenInfo.userId,
    );
  }

  @Post('watch')
  @HttpCode(HttpStatus.OK)
  async watch(
    @Request() req,
    @Body() watchRelation: CreateUserRStadiumDto | ModifyUserRStadiumDto,
  ): Promise<boolean> {
    const tokenInfo: UserEntity = req.user;

    return await this.userRStadiumService.watch({
      ...watchRelation,
      userId: tokenInfo.userId,
    });
  }
}
