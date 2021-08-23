import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceDto } from './dto/space.dto';
import { SpaceInterface } from './interfaces/space.interface';
import { SpaceMatchDto } from './dto/space-match.dto';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addSpace(@Body() params: SpaceDto): Promise<SpaceInterface> {
    return await this.spaceService.addSpace(params);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findByStadium(@Body() params: SpaceDto): Promise<SpaceMatchDto[]> {
    return await this.spaceService.findByStadiumId(params.stadiumId);
  }
}
