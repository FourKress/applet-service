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
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
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
    if (card) {
      return new ResponseSuccess('COMMON.SUCCESS', new MonthlyCardDto(card));
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findById(@Request() req): Promise<IResponse> {
    const tokenInfo: UserEntity = req.user;
    const cards = await this.monthlyCardService.findByUserId(tokenInfo.userId);
    if (cards) {
      return new ResponseSuccess('COMMON.SUCCESS', cards);
    }
    return new ResponseError('COMMON.ERROR.GENERIC_ERROR');
  }
}
