import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { StadiumService } from './stadium.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { StadiumDto } from './dto/stadium.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { NoAuth } from '../common/decorators/no-auth.decorator';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Get('list')
  async findAll(): Promise<IResponse> {
    const stadiums = await this.stadiumService.findAll();
    return new ResponseSuccess(stadiums);
  }

  @NoAuth()
  @Get('info')
  async info(@Query() params: StadiumDto): Promise<IResponse> {
    console.log(params);
    const stadium = await this.stadiumService.findById(params.id);
    return new ResponseSuccess(stadium);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(@Body() modifyStadium: StadiumDto): Promise<IResponse> {
    const stadium = await this.stadiumService.modify(modifyStadium);
    return new ResponseSuccess(stadium);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(@Body() addStadium: CreateStadiumDto) {
    const stadium = await this.stadiumService.add(addStadium);
    return new ResponseSuccess(stadium);
  }

  @Get('stadiumList')
  async stadiumList(@Request() req): Promise<StadiumDto[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.stadiumService.findByBossId(tokenInfo.bossId);
    // return new ResponseSuccess(stadiumList);
  }
}
