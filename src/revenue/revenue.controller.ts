import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { Revenue } from './revenue.entity';
import { RevenueService } from './revenue.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async getInfo(): Promise<any> {
    const revenue = await this.revenueService.getInfo();
    if (!revenue) {
      return {
        msg: '获取营收详情失败!',
        data: null,
        code: 11000,
      };
    }
    return {
      msg: '',
      data: revenue,
      code: 10000,
    };
  }
}
