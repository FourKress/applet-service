import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { UserRSpaceService } from './user-r-space.service';
import { UserRSpace } from './user-r-space.entity';

@Controller('userRSpace')
export class UserRSpaceController {
  constructor(private readonly userRSpaceService: UserRSpaceService) {}

  @Post('add')
  async addSpace(@Body() params: UserRSpace) {
    console.log(params);
    return this.userRSpaceService.watch(params);
  }

  @Get('findAll')
  async findAll() {
    return this.userRSpaceService.findAll();
  }
}
