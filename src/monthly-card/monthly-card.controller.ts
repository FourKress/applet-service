import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { MonthlyCardService } from './monthly-card.service';
import { MonthlyCard } from './monthly-card.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('monthlyCard')
export class MonthlyCardController {
  constructor(private readonly monthlyCardService: MonthlyCardService) {}

  @Post('add')
  @HttpCode(200)
  async addCard(@Request() req, @Body() info: MonthlyCard) {
    const { userId } = req.user;
    const card = await this.monthlyCardService.addMonthlyCard({
      ...info,
      userId,
    });
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

  @Post('list')
  @HttpCode(200)
  async findById(@Request() req) {
    const {
      user: { userId },
    } = req;
    const card = await this.monthlyCardService.findByUserId(userId);
    if (!card) {
      return {
        msg: '获取月卡列表失败!',
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
