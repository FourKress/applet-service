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

  async setMonthlyCard(info: MonthlyCard): Promise<any> {
    const monthlyCard = await this.monthlyCardRepository.save(info);
    return monthlyCard;
  }

  async removeByIds(userId: string): Promise<any> {
    const monthlyCard = await this.monthlyCardRepository.delete({
      userId,
    });
    return monthlyCard;
  }

  async findByIds(userId: string, stadiumId: string): Promise<any> {
    const monthlyCard = await this.monthlyCardRepository.find({
      userId,
      stadiumId,
    });
    return monthlyCard;
  }

  async modifyByIds(info: MonthlyCard): Promise<any> {
    const { userId, stadiumId, ...data } = info;
    const target = await this.findByIds(userId, stadiumId);
    await this.monthlyCardRepository.update(target.id, data);
    const monthlyCard = await this.findByIds(userId, stadiumId);
    return monthlyCard;
  }
}
