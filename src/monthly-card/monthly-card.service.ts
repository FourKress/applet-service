import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { ModifyMonthlyCardDto } from './dto/modify.monthlyCard.dto';
import { StadiumService } from '../stadium/stadium.service';
import { Model } from 'mongoose';
import { MonthlyCard, MonthlyCardDocument } from './schemas/monthlyCard.schema';

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectModel(MonthlyCard.name)
    private readonly monthlyCardModel: Model<MonthlyCardDocument>,
    private readonly stadiumService: StadiumService,
  ) {}

  async addMonthlyCard(info: CreateMonthlyCardDto): Promise<MonthlyCard> {
    const newMonthlyCard = new this.monthlyCardModel(info);
    return await newMonthlyCard.save();
  }

  async removeByIds(userId: string): Promise<any> {
    return this.monthlyCardModel.findOneAndDelete({
      userId,
    });
  }

  async findByUserId(userId: string): Promise<any[]> {
    const relationList = await this.monthlyCardModel.find({
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
    const monthlyCard = await this.monthlyCardModel.findOne(relationInfo);
    return monthlyCard;
  }

  async modifyByIds(modifyInfo: ModifyMonthlyCardDto): Promise<MonthlyCard> {
    const { userId, stadiumId } = modifyInfo;
    const monthlyCard = await this.monthlyCardModel.findOneAndUpdate(
      {
        userId,
        stadiumId,
      },
      {
        $set: modifyInfo,
      },
    );
    return monthlyCard;
  }
}
