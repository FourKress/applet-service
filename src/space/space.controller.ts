import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SpaceService } from './space.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from '../common/dto/response.dto';
import { SpaceInterface } from './interfaces/space.interface';
import { SpaceDto } from './dto/space.dto';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addSpace(@Body() params: SpaceInterface): Promise<IResponse> {
    const space = await this.spaceService.addSpace(params);
    if (space) {
      return new ResponseSuccess('COMMON.SUCCESS', new SpaceDto(space));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findByStadium(@Body() params: string): Promise<IResponse> {
    const spaces = await this.spaceService.findByStadiumId(params);
    if (spaces) {
      return new ResponseSuccess('COMMON.SUCCESS', spaces);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
