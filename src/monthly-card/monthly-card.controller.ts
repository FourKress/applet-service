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
import { ValidationIDPipe } from '../common/pipe/validationID.pipe';

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
  async findById(@Request() req): Promise<MonthlyCard[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.monthlyCardService.findByUserId(tokenInfo.userId);
  }

  @Post('findAll')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Request() req,
    @Body('userId', new ValidationIDPipe()) userId: string,
  ): Promise<MonthlyCard[]> {
    const tokenInfo: UserEntity = req.user;
    return await this.monthlyCardService.findAllByUserId(
      userId,
      tokenInfo.bossId,
    );
  }

  @Post('getInfoByUserId')
  @HttpCode(HttpStatus.OK)
  async infoByUserId(
    @Request() req,
    @Body('userId', new ValidationIDPipe()) userId: string,
  ): Promise<any> {
    const tokenInfo: UserEntity = req.user;
    return await this.monthlyCardService.infoByUserId(userId, tokenInfo.bossId);
  }
}
