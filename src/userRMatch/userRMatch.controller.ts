import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserRMatchService } from './userRMatch.service';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { UserRMatch } from './schemas/userRMatch.schema';
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

@Controller('userRMatch')
export class UserRMatchController {
  constructor(private readonly userRMatchService: UserRMatchService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addRelation(@Body() params: CreateUserRMatchDto): Promise<UserRMatch> {
    return await this.userRMatchService.addRelation(params);
  }

  @Get('findAllByMatchId')
  async findAllByMatchId(
    @Query('matchId', new ValidationIDPipe()) matchId: string,
  ): Promise<UserRMatch[]> {
    return await this.userRMatchService.findAllByMatchId(matchId);
  }
}
