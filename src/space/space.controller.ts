import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceMatchDto } from './dto/space-match.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { Space } from './schemas/space.schema';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';
import { NoAuth } from '../common/decorators/no-auth.decorator';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addSpace(@Body('spaces') spaces: CreateSpaceDto[]): Promise<Space[]> {
    return await this.spaceService.addSpace(spaces);
  }

  @NoAuth()
  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findByStadium(
    @Body('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<SpaceMatchDto[]> {
    return await this.spaceService.findByStadiumId(stadiumId);
  }

  @Get('dropDownList')
  async dropDownList(
    @Query('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<Space[]> {
    return await this.spaceService.dropDownList(stadiumId);
  }

  @Get('remove')
  async removeSpace(
    @Query('id', new ValidationIDPipe()) id: string,
  ): Promise<any> {
    return await this.spaceService.removeSpace(id);
  }

  @Get('unitEnum')
  unitEnum() {
    return this.spaceService.unitEnum();
  }
}
