import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
  async addSpace(@Body() params: CreateSpaceDto): Promise<Space> {
    return await this.spaceService.addSpace(params);
  }

  @NoAuth()
  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findByStadium(
    @Body('stadiumId', new ValidationIDPipe()) stadiumId: string,
  ): Promise<SpaceMatchDto[]> {
    return await this.spaceService.findByStadiumId(stadiumId);
  }
}
