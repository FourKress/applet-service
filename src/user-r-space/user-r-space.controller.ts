import { Controller, Get, Post, Query } from '@nestjs/common';
import { UserRSpaceService } from './user-r-space.service';
import { UserRSpace } from './user-r-space.entity';

@Controller('userRSpace')
export class UserRSpaceController {
  constructor(private readonly userRSpaceService: UserRSpaceService) {}

  @Get('add')
  async addSpace(@Query() params: UserRSpace) {
    console.log(params);
    return 'test';
  }
}
