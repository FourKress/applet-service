import { Controller, Get, Query } from '@nestjs/common';
import { MonthlyCardService } from './monthly-card.service';

@Controller('monthlyCard')
export class MonthlyCardController {
  constructor(private readonly monthlyCardService: MonthlyCardService) {}
}
