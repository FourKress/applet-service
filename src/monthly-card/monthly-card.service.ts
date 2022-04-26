import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { ModifyMonthlyCardDto } from './dto/modify.monthlyCard.dto';
import { Model } from 'mongoose';
import { MonthlyCard, MonthlyCardDocument } from './schemas/monthlyCard.schema';
import { Stadium } from '../stadium/schemas/stadium.schema';
import { StadiumService } from '../stadium/stadium.service';

const Moment = require('moment');

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectModel(MonthlyCard.name)
    private readonly monthlyCardModel: Model<MonthlyCardDocument>,
    private readonly stadiumService: StadiumService,
  ) {}

  async addMonthlyCard(info: CreateMonthlyCardDto): Promise<MonthlyCard> {
    const newMonthlyCard = new this.monthlyCardModel(
      Object.assign({}, info, {
        stadium: info.stadiumId,
      }),
    );
    return await newMonthlyCard.save();
  }

  async findAll(): Promise<MonthlyCard[]> {
    return await this.monthlyCardModel.find().ne('validFlag', false).exec();
  }

  async changeCardValid(id: string, validFlag: boolean): Promise<any> {
    return this.monthlyCardModel.findByIdAndUpdate(id, {
      validFlag,
    });
  }

  async findByUserId(userId: string): Promise<MonthlyCard[]> {
    const relationList = await this.monthlyCardModel
      .find({
        userId,
        validFlag: true,
      })
      .populate('stadium', { name: 1, monthlyCardPrice: 1 }, Stadium.name)
      .exec();
    return relationList;
  }

  async checkMonthlyCard(relationInfo: any, orderCreatedAt): Promise<any> {
    const { validFlag = null } = relationInfo;
    if (validFlag) {
      const monthlyCard = await this.monthlyCardModel.findOne(relationInfo);
      if (
        Moment(monthlyCard.validPeriodEnd).valueOf() <
        Moment().startOf('day').valueOf()
      ) {
        return false;
      }
      return monthlyCard;
    } else {
      const monthlyCard = await this.monthlyCardModel.find(relationInfo);
      return monthlyCard.filter(
        (d) =>
          Moment(d.validPeriodStart).valueOf() <= orderCreatedAt &&
          Moment(d.validPeriodEnd).valueOf() >= orderCreatedAt,
      )[0];
    }
  }

  async getMonthlyCardBySId(stadiumId: string): Promise<MonthlyCard[]> {
    const monthlyCardList = await this.monthlyCardModel.find({
      stadiumId,
      validFlag: true,
    });
    return monthlyCardList;
  }

  async getStadiumIds(bossId) {
    const stadiumList = await this.stadiumService.findByBossId(bossId);
    const ids = stadiumList.map((d: any) => {
      const item = d.toJSON();
      return item.id;
    });
    return ids;
  }

  async findAllByUserId(
    userId: string,
    bossId: string,
  ): Promise<MonthlyCard[]> {
    const ids = await this.getStadiumIds(bossId);

    const relationList = await this.monthlyCardModel
      .find({
        userId,
      })
      .in('stadiumId', ids)
      .populate('stadium', { name: 1, monthlyCardPrice: 1 }, Stadium.name)
      .exec();
    return relationList;
  }

  async infoByUserId(userId: string, bossId: string): Promise<any> {
    const ids = await this.getStadiumIds(bossId);

    const relationList = await this.monthlyCardModel
      .find({
        userId,
      })
      .in('stadiumId', ids)
      .sort({ createdAt: 'desc' })
      .exec();
    return {
      count: relationList.length,
      time: relationList[0]?.validPeriodEnd,
    };
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
