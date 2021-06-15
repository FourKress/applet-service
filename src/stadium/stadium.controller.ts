import { Controller, Get, Post, Query } from '@nestjs/common';
import { StadiumService } from './stadium.service';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Get()
  async info() {
    return 'test';
  }

  @Post()
  async modify() {}

  @Post()
  async add() {}
}
