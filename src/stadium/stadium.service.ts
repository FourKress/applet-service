import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
import { WxGroupService } from '../wxGroup/wxGroup.service';
import { UsersService } from '../users/users.service';
import { OrderService } from '../order/order.service';
import { SpaceService } from '../space/space.service';

const Moment = require('moment');

@Injectable()
export class StadiumService {
  constructor(
    @InjectModel(Stadium.name)
    private readonly stadiumModel: Model<StadiumDocument>,
    private readonly userRStadiumService: UserRStadiumService,
    private readonly matchService: MatchService,
    @Inject(forwardRef(() => MonthlyCardService))
    private readonly monthlyCardService: MonthlyCardService,
    private readonly wxGroupService: WxGroupService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly spaceService: SpaceService,
  ) {}

  async findAll(): Promise<Stadium[]> {
    return this.stadiumModel
      .find({
        validFlag: true,
      })
      .exec();
  }

  async adminList(params): Promise<Stadium[]> {
    const keys = Object.keys(params);
    let data = params;
    if (keys.includes('applyBot')) {
      data = {
        ...params,
        botStatus: false,
      };
    }
    const stadiumList = await this.stadiumModel.find({...data,
      isDelete: false,}).exec();
    const result = [];
    await Promise.all(
      stadiumList.map(async (s) => {
        const stadium = s.toJSON();
        const user = await this.usersService.findByBossId(s.bossId);
        result.push({
          ...stadium,
          user,
        });
      }),
    );
    return result;
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
    return await this.stadiumModel.find({ bossId, isDelete: false }).exec();
  }

  async checkName2Id(name: string): Promise<string> {
    const hasStadium = await this.stadiumModel
      .findOne({
        name,
        isDelete: false,
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
      ToolsService.fail('添加失败，场馆名称已存在！');
      return;
    }
    const newStadium = new this.stadiumModel(addStadium);
    return await newStadium.save();
  }

  async checkActive(id) {
    const monthlyCardList = await this.monthlyCardService.getMonthlyCardBySId(
      id,
    );
    if (monthlyCardList?.length) {
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
      ToolsService.fail('修改失败，场馆名称已存在！');
    }
    const stadiumFromDB = await this.stadiumModel.findById(id);
    if (stadiumInfo.monthlyCardStatus !== stadiumFromDB.monthlyCardStatus) {
      await this.checkActive(id);
    }

    let wxGroup: any = {};
    if (stadiumInfo?.wxGroup && !stadiumFromDB?.wxGroup) {
      const wxGroupFromDB: any = await this.wxGroupService.findByWxGroupName(
        stadiumInfo.wxGroup,
      );
      wxGroup = wxGroupFromDB ? wxGroupFromDB?.toJSON() : {};
      if (!wxGroupFromDB || stadiumInfo.wxGroup !== wxGroup.wxGroupName) {
        ToolsService.fail(
          '求队机器人还未加入到关联的微信群，无法提供自动分享功能，请检查后再试！',
        );
        return;
      } else {
        if (wxGroup?.stadiumId && wxGroup?.bossId) {
          await this.wxGroupService.add({
            wxGroupName: wxGroup.wxGroupName,
            wxGroupId: wxGroup.wxGroupId,
            bossId: stadiumInfo.bossId,
            stadiumId: id,
          });
        } else {
          await this.wxGroupService.modify({
            id: wxGroup.id,
            wxGroupName: stadiumInfo.wxGroup,
            bossId: stadiumInfo.bossId,
            stadiumId: id,
          });
        }
      }
    }

    return await this.stadiumModel
      .findByIdAndUpdate(id, {
        ...stadiumInfo,
        wxGroupId: stadiumInfo?.wxGroupId || wxGroup?.wxGroupId || '',
        validFlag: true,
      })
      .exec();
  }

  async modifyRemarks(id, unit, oldUnit = ''): Promise<Stadium> {
    const stadium = await this.findById(id);
    const remarks = stadium.remarks ? stadium.remarks.split('，') : [];
    const unitLabel: any = UnitEnum.find((d) => d.value === unit)?.label;
    let oldUnitLabel: any = '';
    if (oldUnit) {
      oldUnitLabel = UnitEnum.find((d) => d.value === oldUnit)?.label;
    }
    const realRemarks = oldUnitLabel
      ? remarks.filter((d) => d !== oldUnitLabel)
      : remarks;
    const newRemarks = [...new Set(realRemarks.concat(unitLabel))].join('，');
    return await this.stadiumModel
      .findByIdAndUpdate(id, {
        remarks: newRemarks,
      })
      .exec();
  }

  async waitStartList(userId, search): Promise<Stadium[]> {
    const { type, keywords = null } = search;
    const reg = new RegExp(keywords, 'i');

    switch (Number(type)) {
      case 1:
        let stadiumList = [];
        if (keywords) {
          stadiumList = await this.stadiumModel
            .find({
              name: { $regex: reg },
              validFlag: true,
              isDelete: false,
            })
            .exec();
        } else {
          stadiumList = await this.findAll();
        }
        return await this.filterStadiumByMatch(stadiumList);
        break;
      case 2:
        const watchList = await this.userRStadiumService.watchListByUserId(
          userId,
        );
        const ids = watchList.map((d: any) => d.stadiumId);
        let stadiumWatchList = [];
        if (keywords) {
          stadiumWatchList = await this.stadiumModel
            .find({
              name: { $regex: reg },
              isDelete: false,
            })
            .in('_id', ids)
            .exec();
        } else {
          stadiumWatchList = await this.stadiumModel
            .find({ isDelete: false })
            .in('_id', ids)
            .exec();
        }
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
    return await this.stadiumModel
      .find({ name: { $regex: reg }, isDelete: false })
      .exec();
  }

  async checkValidStatus(stadiumId): Promise<boolean> {
    const stadiumFromDB = await this.stadiumModel.findById(stadiumId);
    const stadium = stadiumFromDB.toJSON();
    const checkKeys = [
      'longitude',
      'latitude',
      'phoneNum',
      'address',
      'stadiumUrls',
      // 'wxGroup',
      // 'wxGroupId',
    ];
    let flag = true;
    checkKeys.forEach((key) => {
      if (!flag) return;
      flag = !!stadium[key];
    });

    return flag;
  }

  async modifyWxGroupName(wxGroup): Promise<any> {
    const { wxGroupId, wxGroupName } = wxGroup;
    await this.wxGroupService.modifyWxGroupName(wxGroup);
    return await this.stadiumModel
      .updateMany(
        { wxGroupId, isDelete: false },
        {
          wxGroup: wxGroupName,
        },
      )
      .exec();
  }

  async remove(params): Promise<boolean> {
    const { stadiumId, bossId } = params;
    const checkOrder = await this.orderService.findActiveOrderByStadium(
      stadiumId,
    );
    if (checkOrder?.length) {
      ToolsService.fail('删除失败，有订单正在使用中。');
      return;
    }
    const checkMonthlyCard = await this.monthlyCardService.getMonthlyCardBySId(
      stadiumId,
    );
    if (checkMonthlyCard?.length) {
      ToolsService.fail('删除失败，有月卡未到期。');
      return;
    }
    const count = await this.stadiumModel
      .find({
        bossId,
      })
      .count();
    if (count <= 1) {
      const user: any = await this.usersService.findByBossId(bossId);
      await this.usersService.modify({
        id: user.toJSON().id,
        bossId: '',
        withdrawAt: 0,
        balanceAmt: 0,
      });
    }
    await this.stadiumModel
      .findByIdAndUpdate(stadiumId, { isDelete: true })
      .exec();
    await this.spaceService.deleteByStadiumId(stadiumId);
    await this.matchService.deleteByStadiumId(stadiumId);
    return true;
  }

  async modifyByWechatyBotStatus(stadium, status): Promise<Stadium> {
    return this.stadiumModel.findByIdAndUpdate(stadium, {
      applyBot: status,
    });
  }

  async changeBotStatus(params): Promise<any> {
    const { stadiumId, botStatus } = params;
    let stadium;
    if (botStatus) {
      stadium = {
        botStatus: true,
      };
    } else {
      stadium = {
        wxGroup: '',
        wxGroupId: '',
        botStatus: false,
        applyBot: false,
      };
    }
    await this.stadiumModel.findByIdAndUpdate(stadiumId, stadium);
  }
}
