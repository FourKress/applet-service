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
import { ResponseSuccess } from '../common/dto/response.dto';
import { NoAuth } from '../common/decorators/no-auth.decorator';

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
  async info(@Query() params: any): Promise<any> {
    const stadium = await this.stadiumService.findById(params.id);
    return new ResponseSuccess(new StadiumDto(stadium));
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modify(@Body() modifyStadium: StadiumInterface): Promise<IResponse> {
    const stadium = await this.stadiumService.modify(modifyStadium);
    return new ResponseSuccess(new StadiumDto(stadium));
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async add(@Body() addStadium: CreateStadiumDto) {
    const stadium = await this.stadiumService.add(addStadium);
    return new ResponseSuccess(new StadiumDto(stadium));
  }
}
