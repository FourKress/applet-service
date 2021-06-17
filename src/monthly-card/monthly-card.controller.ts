import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { MonthlyCardService } from './monthly-card.service';
import { MonthlyCard } from './monthly-card.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('monthlyCard')
export class MonthlyCardController {
  constructor(private readonly monthlyCardService: MonthlyCardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addCard(@Body() info: MonthlyCard) {
    const card = await this.monthlyCardService.addMonthlyCard(info);
    if (!card) {
      return {
        msg: '添加月卡失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: card,
      code: 10000,
    };
  }
}
