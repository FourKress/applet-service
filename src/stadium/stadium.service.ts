import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { ToolsService } from '../common/utils/tools-service';
import { Stadium, StadiumDocument } from './schemas/stadium.schema';
import { ModifyStadiumDto } from './dto/modify-stadium.dto';
import { UserRStadiumService } from '../userRStadium/userRstadium.service';
import { MatchService } from '../match/match.service';
import { UnitEnum } from '../common/enum/space.enum';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';

const Moment = require('moment');

@Injectable()
export class StadiumService {
  constructor(
    @InjectModel(Stadium.name)
    private readonly stadiumModel: Model<StadiumDocument>,
    private readonly userRStadiumService: UserRStadiumService,
    private readonly matchService: MatchService,
    private readonly monthlyCardService: MonthlyCardService,
  ) {}

  async findAll(): Promise<Stadium[]> {
    return this.stadiumModel.find().exec();
  }

  async findById(id: string): Promise<Stadium> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.stadiumModel.findById(id).exec();
  }

  async findByBossId(bossId: string): Promise<Stadium[]> {
    if (!bossId) {
      ToolsService.fail('bossId不能为空！');
    }
    return await this.stadiumModel.find({ bossId }).exec();
  }

  async checkName2Id(name: string): Promise<string> {
    const hasStadium = await this.stadiumModel
      .findOne({
        name,
      })
      .exec();
    const id = hasStadium?._id;
    if (!id) {
      return '';
    }
    return Types.ObjectId(id).toHexString();
  }

  async add(addStadium: CreateStadiumDto): Promise<Stadium> {
    const { name } = addStadium;
    if (await this.checkName2Id(name)) {
      ToolsService.fail('添加失败，球场名称已存在！');
      return;
    }
    const newStadium = new this.stadiumModel(addStadium);
    return await newStadium.save();
  }

  async checkActive(id) {
    const monthlyCardList = await this.monthlyCardService.getMonthlyCardBySId(
      id,
    );
    const validFlag = monthlyCardList.some((d) => !d.validFlag);
    if (validFlag) {
      ToolsService.fail('不能修改月卡状态，有订单正在使用！');
      return false;
    }
    return true;
  }

  async modify(modifyStadium: ModifyStadiumDto): Promise<Stadium> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    const hasStadium = await this.checkName2Id(stadiumInfo.name);
    if (hasStadium !== id) {
      ToolsService.fail('修改失败，球场名称已存在！');
    }
    const stadiumFromDB = await this.stadiumModel.findById(id);
    if (stadiumInfo.monthlyCardStatus !== stadiumFromDB.monthlyCardStatus) {
      await this.checkActive(id);
    }

    return await this.stadiumModel.findByIdAndUpdate(id, stadiumInfo).exec();
  }

  async modifyRemarks(id, unit, oldUnit = ''): Promise<Stadium> {
    const stadium = await this.findById(id);
    const unitLabel: any = UnitEnum.find((d) => d.value === unit)?.label;
    const oldUnitLabel: any = UnitEnum.find((d) => d.value === oldUnit)?.label;
    const remarks = stadium.remarks ? stadium.remarks.split('，') : [];
    const realRemarks = remarks.filter((d) => d !== oldUnitLabel);
    const newRemarks = [...new Set(realRemarks.concat(unitLabel))].join('，');
    return await this.stadiumModel
      .findByIdAndUpdate(id, {
        remarks: newRemarks,
      })
      .exec();
  }

  async waitStartList(userId, search): Promise<Stadium[]> {
    const { type } = search;
    switch (Number(type)) {
      case 1:
        const stadiumList = await this.findAll();
        return await this.filterStadiumByMatch(stadiumList);
        break;
      case 2:
        const watchList = await this.userRStadiumService.watchListByUserId(
          userId,
        );
        const ids = watchList.map((d: any) => d.stadiumId);
        const stadiumWatchList = await this.stadiumModel
          .find({
            isWatch: true,
          })
          .in('_id', ids)
          .exec();
        return await this.filterStadiumByMatch(stadiumWatchList);
        break;
      default:
        break;
    }
  }

  async filterStadiumByMatch(stadiumList) {
    const result = [];
    await Promise.all(
      stadiumList.map(async (item: any) => {
        const stadium = item.toJSON();
        const match = (
          await this.matchService.findByStadiumId({
            stadiumId: stadium.id,
          })
        )
          .filter((item) => {
            const time = Moment().startOf('day').diff(item.runDate);
            return item.status && time <= 0;
          })
          .sort(
            (a: any, b: any) =>
              Moment(a.runDate).valueOf() - Moment(b.runDate).valueOf(),
          );
        if (match?.length) {
          result.push({
            ...stadium,
            matchInfo: match[0],
          });
        }
      }),
    );
    return result;
  }

  async uploadFile(files, openId) {
    const { filename } = files[0];
    return {
      path: `/${openId}/${filename}`,
      fileId: filename.replace(/.png/g, ''),
    };
  }

  async findByName(name): Promise<Stadium[]> {
    const reg = new RegExp(name, 'i');
    return await this.stadiumModel.find({ name: { $regex: reg } }).exec();
  }
}
