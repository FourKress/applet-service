import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SpaceService } from './space.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { SpaceDto } from './dto/space.dto';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addSpace(@Body() params: SpaceDto): Promise<IResponse> {
    const space = await this.spaceService.addSpace(params);
    return new ResponseSuccess(new SpaceDto(space));
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findByStadium(@Body() params: SpaceDto): Promise<IResponse> {
    const spaces = await this.spaceService.findByStadiumId(params.stadiumId);
    return new ResponseSuccess(spaces);
  }
}
