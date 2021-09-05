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
import { ModifySpaceDto } from './dto/modify-space.dto';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addSpace(@Body() space: CreateSpaceDto): Promise<Space> {
    return await this.spaceService.addSpace(space);
  }

  @Post('modify')
  @HttpCode(HttpStatus.OK)
  async modifySpace(@Body() space: ModifySpaceDto): Promise<Space> {
    return await this.spaceService.modifySpace(space);
  }

  @NoAuth()
  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findByStadium(@Body() params: any): Promise<SpaceMatchDto[]> {
    return await this.spaceService.findByStadiumId(params);
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

  @NoAuth()
  @Get('unitEnum')
  unitEnum() {
    return this.spaceService.unitEnum();
  }
}
