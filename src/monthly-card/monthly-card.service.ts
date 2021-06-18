import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyCard } from './monthly-card.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectRepository(MonthlyCard)
    private readonly monthlyCardRepository: Repository<MonthlyCard>,
  ) {}

  async addMonthlyCard(info: MonthlyCard): Promise<any> {
    const monthlyCard = await this.monthlyCardRepository.save(info);
    return monthlyCard;
  }

  async removeByIds(userId: string): Promise<any> {
    const monthlyCard = await this.monthlyCardRepository.delete({
      userId,
    });
    return monthlyCard;
  }

  async findById(userId: string): Promise<MonthlyCard[]> {
    const monthlyCard = await this.monthlyCardRepository.find({
      userId,
    });
    return monthlyCard;
  }

  async modifyByIds(modifyInfo: MonthlyCard): Promise<any> {
    const { userId, stadiumId, ...data } = modifyInfo;
    const target = await this.monthlyCardRepository.findOne({
      userId,
      stadiumId,
    });
    const info = {
      ...target,
      ...data,
    };
    const monthlyCard = await this.monthlyCardRepository.save(info);
    return monthlyCard;
  }
}
