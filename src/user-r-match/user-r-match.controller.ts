import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { UserRMatchService } from './user-r-match.service';
import { UserRMatch } from './user-r-match.entity';

@Controller('userRMatch')
export class UserRMatchController {
  constructor(private readonly userRMatchService: UserRMatchService) {}

  @Post('add')
  async addRelation(@Body() params: UserRMatch) {
    console.log(params);
    return this.userRMatchService.addRelation(params);
  }

  @Get('findAll')
  async findAll() {
    return this.userRMatchService.findAll();
  }
}
