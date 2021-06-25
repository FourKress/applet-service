import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyCard } from './monthly-card.entity';
import { StadiumService } from '../stadium/stadium.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectRepository(MonthlyCard)
    private readonly monthlyCardRepository: Repository<MonthlyCard>,
    private readonly stadiumService: StadiumService,
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

  async findByUserId(userId: string): Promise<any[]> {
    const relationList = await this.monthlyCardRepository.find({
      userId,
    });
    const monthlyCardList = await Promise.all(
      relationList.map(async (relation) => {
        const stadiumInfo = await this.stadiumService.findById(
          relation.stadiumId,
        );
        return {
          ...relation,
          stadiumName: stadiumInfo.name,
          monthlyCardPrice: stadiumInfo.monthlyCardPrice,
        };
      }),
    );

    return monthlyCardList;
  }

  async checkMonthlyCard(relationInfo: any): Promise<MonthlyCard> {
    const monthlyCard = await this.monthlyCardRepository.findOne(relationInfo);
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
