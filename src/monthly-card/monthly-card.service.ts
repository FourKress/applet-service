import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { ModifyMonthlyCardDto } from './dto/modify.monthlyCard.dto';
import { Model } from 'mongoose';
import { MonthlyCard, MonthlyCardDocument } from './schemas/monthlyCard.schema';
import { Stadium } from '../stadium/schemas/stadium.schema';
import { UsersService } from '../users/users.service';
import { StadiumService } from '../stadium/stadium.service';

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectModel(MonthlyCard.name)
    private readonly monthlyCardModel: Model<MonthlyCardDocument>,
    private readonly userService: UsersService,
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
    const monthlyCard = await this.monthlyCardModel.findByIdAndUpdate(id, {
      validFlag,
    });
    const userId = monthlyCard.userId;
    const user = await this.userService.findOneById(userId);
    const monthlyCardCount = user.monthlyCardCount + (validFlag ? 1 : -1);
    await this.userService.modify({
      id: userId,
      monthlyCardCount,
    });
    return monthlyCard;
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

  async checkMonthlyCard(relationInfo: any): Promise<MonthlyCard> {
    const monthlyCard = await this.monthlyCardModel.findOne(relationInfo);
    return monthlyCard;
  }

  async getMonthlyCardBySId(stadiumId: string): Promise<MonthlyCard[]> {
    const monthlyCardList = await this.monthlyCardModel.find({
      stadiumId,
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
