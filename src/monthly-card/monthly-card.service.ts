import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMonthlyCardDto } from './dto/create.monthlyCard.dto';
import { ModifyMonthlyCardDto } from './dto/modify.monthlyCard.dto';
import { Model } from 'mongoose';
import { MonthlyCard, MonthlyCardDocument } from './schemas/monthlyCard.schema';
import { Stadium } from '../stadium/schemas/stadium.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class MonthlyCardService {
  constructor(
    @InjectModel(MonthlyCard.name)
    private readonly monthlyCardModel: Model<MonthlyCardDocument>,
    private readonly userService: UsersService,
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
