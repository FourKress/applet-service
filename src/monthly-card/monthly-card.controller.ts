import {
  Controller,
  Post,
  Body,
  HttpCode,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { MonthlyCardService } from './monthly-card.service';
import { IResponse } from '../common/interfaces/response.interface';
import { ResponseSuccess } from '../common/dto/response.dto';
import { MonthlyCardDto } from './dto/monthlyCard.dto';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { UserEntity } from '../auth/interfaces/user-entity.interface';

@Controller('monthlyCard')
export class MonthlyCardController {
  constructor(private readonly monthlyCardService: MonthlyCardService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addCard(
    @Request() req,
    @Body() info: CreateMonthlyCardDto,
  ): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const card = await this.monthlyCardService.addMonthlyCard({
      ...info,
      userId: tokenInfo.userId,
    });
    return new ResponseSuccess(new MonthlyCardDto(card));
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findById(@Request() req): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const cards = await this.monthlyCardService.findByUserId(tokenInfo.userId);
    return new ResponseSuccess(cards);
  }
}
