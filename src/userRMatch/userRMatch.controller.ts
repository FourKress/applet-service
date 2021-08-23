import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { UserRMatchService } from './userRMatch.service';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { UserRMatchInterface } from './interfaces/userRMatch.interface';

@Controller('userRMatch')
export class UserRMatchController {
  constructor(private readonly userRMatchService: UserRMatchService) {}

  @Post('add')
  async addRelation(
    @Body() params: CreateUserRMatchDto,
  ): Promise<UserRMatchInterface> {
    return await this.userRMatchService.addRelation(params);
  }

  @Get('findAllByMatchId')
  async findAllByMatchId(
    @Query() params: UserRMatchInterface,
  ): Promise<UserRMatchInterface[]> {
    return await this.userRMatchService.findAllByMatchId(params.matchId);
  }
}
