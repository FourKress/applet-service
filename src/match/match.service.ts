import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { CreateMatchDto } from './dto/create-match.dto';
import { ModifyMatchDto } from './dto/modify-match.dto';
import { MatchRunDto } from './dto/match-run.dto';
import { MatchSpaceInterface } from './interfaces/match-space.interface';
import { ToolsService } from '../common/utils/tools-service';
import { RepeatModel, WeekEnum } from '../common/enum/match.enum';
import { Space } from '../space/schemas/space.schema';
import * as nzh from 'nzh';
import { OrderService } from '../order/order.service';
import { UserRMatchService } from '../userRMatch/userRMatch.service';
import { StadiumService } from '../stadium/stadium.service';

const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly userRMatchService: UserRMatchService,
    @Inject(forwardRef(() => StadiumService))
    private readonly stadiumService: StadiumService,
  ) {}

  async findAllBase(): Promise<Match[]> {
    return await this.matchModel
      .find()
      .exists('parentId', false)
      .ne('repeatModel', 1)
      .exec();
  }

  async findBySpaceId(params: any): Promise<MatchSpaceInterface[]> {
    const matchList = (
      await this.matchModel
        .find({
          ...params,
          status: true,
        })
        .exec()
    ).sort((a: any, b: any) => Moment(a.endAt) - Moment(b.endAt));
    const coverMatchList = matchList.map((item: any) => {
      const match = item.toJSON();
      return {
        ...match,
        ...this.getDoneAndCancelStatus(match),
      };
    });
    return coverMatchList;
  }

  async findByStadiumId(params: any, type = ''): Promise<Match[]> {
    const search = this.matchModel
      .find(params)
      .populate('space', { name: 1 }, Space.name);
    if (type) {
      return (await search.exists('parentId', false).exec()).filter((match) =>
        this.matchFilter(match, type),
      );
    }
    return await search.exec();
  }

  matchFilter(match, type) {
    const time = Moment().startOf('day').diff(match.runDate);
    if (type === 'lt') {
      if (match.repeatModel !== 1 || time <= 0) {
        return true;
      }
    } else if (type === 'gt') {
      if (match.repeatModel === 1 && time > 0) {
        return true;
      }
    }
    return false;
  }

  async findByRunData(params: MatchRunDto): Promise<Match[]> {
    const matchList = await this.matchModel
      .find(params)
      .populate('space', { name: 1 }, Space.name)
      .exec();
    return matchList.map((item: any) => {
      const match = item.toJSON();
      return {
        ...match,
        ...this.getDoneAndCancelStatus(match),
      };
    });
  }

  getDoneAndCancelStatus(match) {
    const { runDate, startAt, endAt, minPeople, selectPeople } = match;
    const isDone = Moment().diff(`${runDate} ${endAt}`) > 0;
    const isCancel =
      Moment().diff(`${runDate} ${startAt}`) > 0 && selectPeople < minPeople;
    return {
      isDone,
      isCancel,
    };
  }

  async findById(id: string): Promise<Match> {
    return await this.matchModel.findById(id).exec();
  }

  async details(id: string): Promise<MatchSpaceInterface> {
    const match: any = (await this.matchModel.findById(id).exec()).toJSON();
    return Object.assign({}, match, this.getDoneAndCancelStatus(match));
  }

  async addMatch(addMatch: CreateMatchDto): Promise<Match> {
    const {
      spaceId,
      startAt,
      endAt,
      repeatModel,
      repeatWeek,
      runDate,
    } = addMatch;
    const hasMatch = await this.matchModel.findOne({
      spaceId,
      startAt,
      endAt,
      repeatModel,
    });
    if (hasMatch || !spaceId) {
      ToolsService.fail(
        !spaceId ? 'spaceId不能为空！' : '添加失败，相同场次已存在！',
      );
    }
    const repeatName = this.setRepeatName(repeatModel, repeatWeek, runDate);

    const newMatch = new this.matchModel(
      Object.assign({}, addMatch, {
        repeatName,
        space: spaceId,
      }),
    );

    if (repeatModel !== 1) {
      await this.autoAddRepeatMatch(newMatch.toJSON(), 'add');
    }

    return await newMatch.save();
  }

  setRepeatName(repeatModel, repeatWeek, runDate) {
    let repeatName;
    switch (repeatModel) {
      case 1:
        repeatName = runDate;
        break;
      case 2:
        const weekNames = repeatWeek
          .sort()
          .map((d) => {
            return nzh.cn.encodeS(d);
          })
          .join('、');
        repeatName = `每周${weekNames}`;
        break;
      case 3:
        repeatName = '每天';
        break;
      default:
        break;
    }
    return repeatName;
  }

  async modifyMatchSelectPeople(match: ModifyMatchDto): Promise<Match> {
    const { id, selectPeople } = match;
    return await this.matchModel
      .findByIdAndUpdate(id, {
        selectPeople,
      })
      .exec();
  }

  async modifyMatch(modifyMatch: ModifyMatchDto): Promise<Match> {
    const { id, spaceId, ...match } = modifyMatch;
    if (!id || !spaceId) {
      ToolsService.fail(`${id ? 'spaceId' : 'id'} 不能为空`);
    }

    const { repeatModel, repeatWeek, runDate } = match;
    const repeatName = this.setRepeatName(repeatModel, repeatWeek, runDate);

    const matchFromDB = await this.matchModel
      .findByIdAndUpdate(id, {
        ...match,
        repeatName,
      })
      .exec();

    if (repeatModel !== 1) {
      await this.autoAddRepeatMatch(matchFromDB.toJSON(), 'modify');
    }
    return matchFromDB;
  }

  async changeMatchSelectPeople(params: any): Promise<any> {
    const { id, ...match } = params;
    return await this.matchModel
      .findByIdAndUpdate(id, {
        ...match,
      })
      .exec();
  }

  async removeMatch(id: string): Promise<any> {
    await this.matchModel.findByIdAndDelete(id);
  }

  repeatModelEnum() {
    return RepeatModel;
  }

  weekEnum() {
    return WeekEnum;
  }

  async cancel(id: string): Promise<any> {
    const match = await this.matchModel.findById(id);
    const { runDate, endAt } = match;
    if (Moment().diff(Moment(`${runDate} ${endAt}`), 'minutes') >= 0) {
      ToolsService.fail('场次已结束，不能取消');
      return;
    }
    // TODO 处理订单相关的状态、退款
    await this.matchModel.findByIdAndUpdate(id, {
      status: false,
    });
  }

  async autoAddRepeatMatch(match, type) {
    const { id, ...info } = match;
    const { repeatModel, repeatWeek = [] } = info;
    await this.matchModel.deleteMany({ parentId: id });
    const dayList = Array(6)
      .fill(1)
      .map((d, i) => d + i);
    await Promise.all(
      dayList.map(async (day) => {
        const runDate = Moment()
          .startOf('day')
          .add(day, 'day')
          .format('YYYY-MM-DD');
        if (repeatModel == 2) {
          const week = Moment(runDate).day();
          if (repeatWeek.includes(week ? week : 7)) {
            await this.changeRepeatMatch(id, info, runDate, type);
          }
        } else if (repeatModel === 3) {
          await this.changeRepeatMatch(id, info, runDate, type);
        }
      }),
    );
  }

  async changeRepeatMatch(id, match, runDate, type) {
    let targetId;
    if (type === 'add') {
      targetId = Types.ObjectId().toHexString();
    } else if (type === 'modify') {
      const target = await this.matchModel
        .findOne({ parentId: id, runDate })
        .exec();
      targetId = target ? target.toJSON().id : Types.ObjectId().toHexString();
    }
    await this.matchModel
      .findByIdAndUpdate(
        targetId,
        { ...match, runDate, parentId: id },
        {
          upsert: true,
        },
      )
      .exec();
  }

  async findWaitStartList(userId: string): Promise<any> {
    const db = this.userRMatchService.relationByUserId(userId);
    const relationList = await db
      .where('expirationDate')
      .gte(Moment().startOf('day').valueOf())
      .exec();
    const coverList = [];
    const matchList = await this.matchModel
      .find()
      .in(
        '_id',
        relationList.map((d) => d.matchId),
      )
      .exec();

    await Promise.all(
      relationList.map(async (r) => {
        const match = matchList
          .find((d) => d.toJSON().id === r.matchId)
          ?.toJSON();
        const isEnd =
          Moment().diff(Moment(`${match.runDate} ${match.endAt}`)) > 0;
        const isMin = match.selectPeople >= match.minPeople;
        const isCancel =
          Moment().diff(Moment(`${match.runDate} ${match.startAt}`)) > 0 &&
          !isMin;
        if (isEnd || isCancel) {
          return;
        }

        const isStart =
          Moment().diff(Moment(`${match.runDate} ${match.startAt}`)) > 0
            ? 3
            : isMin
            ? 1
            : 2;

        const stadium: any = await this.stadiumService.findById(r.stadiumId);
        const { name, stadiumUrls, address } = stadium.toJSON();
        const data = {
          ...match,
          stadiumName: name,
          stadiumUrls,
          stadiumAddress: address,
          isStart,
        };
        coverList.push(data);
      }),
    );

    return coverList.sort((a: any, b: any) =>
      Moment(`${a.runDate} ${a.startAt}`).diff(
        Moment(`${b.runDate} ${b.startAt}`),
      ),
    );
  }
}
