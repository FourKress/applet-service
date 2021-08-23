import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MonthlyCardInterface } from './interfaces/monthlyCard.interface';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { StadiumService } from '../stadium/stadium.service';
import { Model } from 'mongoose';

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectModel('MonthlyCard')
    private readonly monthlyCardModel: Model<MonthlyCardInterface>,
    private readonly stadiumService: StadiumService,
  ) {}

  async addMonthlyCard(
    info: CreateMonthlyCardDto,
  ): Promise<MonthlyCardInterface> {
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

  async checkMonthlyCard(relationInfo: any): Promise<MonthlyCardInterface> {
    const monthlyCard = await this.monthlyCardModel.findOne(relationInfo);
    return monthlyCard;
  }

  async modifyByIds(
    modifyInfo: MonthlyCardInterface,
  ): Promise<MonthlyCardInterface> {
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
