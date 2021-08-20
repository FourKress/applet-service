import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { StadiumService } from './stadium.service';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { StadiumInterface } from './interfaces/stadium,interface';
import { StadiumDto } from './dto/stadium.dto';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Get('list')
  async findAll(): Promise<IResponse> {
    const stadiums = await this.stadiumService.findAll();
    if (stadiums) {
      return new ResponseSuccess('COMMON.SUCCESS', stadiums);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @NoAuth()
  @Get('info')
  async info(@Query() params: StadiumInterface): Promise<IResponse> {
    const stadium = await this.stadiumService.findById(params.id);
    if (stadium) {
      return new ResponseSuccess('COMMON.SUCCESS', new StadiumDto(stadium));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(@Body() modifyStadium: StadiumInterface): Promise<IResponse> {
    const stadium = await this.stadiumService.modify(modifyStadium);
    if (stadium) {
      return new ResponseSuccess('COMMON.SUCCESS', new StadiumDto(stadium));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(@Body() addStadium: CreateStadiumDto) {
    const stadium = await this.stadiumService.add(addStadium);
    if (stadium) {
      return new ResponseSuccess('COMMON.SUCCESS', new StadiumDto(stadium));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
