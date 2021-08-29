import {
  Controller,
  Post,
  Body,
  HttpCode,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { MonthlyCardService } from './monthly-card.service';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { UserEntity } from '../auth/interfaces/user-entity.interface';
import { MonthlyCard } from './schemas/monthlyCard.schema';

@Controller('monthlyCard')
export class MonthlyCardController {
  constructor(private readonly monthlyCardService: MonthlyCardService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addCard(
    @Request() req,
    @Body() info: CreateMonthlyCardDto,
  ): Promise<MonthlyCard> {
    const tokenInfo: UserEntity = req.user;
    return await this.monthlyCardService.addMonthlyCard({
      ...info,
      userId: tokenInfo.userId,
    });
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  async findById(@Request() req): Promise<any> {
    const tokenInfo: UserEntity = req.user;
    return await this.monthlyCardService.findByUserId(tokenInfo.userId);
  }
}
