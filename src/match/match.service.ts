import { Injectable } from '@nestjs/common';
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

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
      match.isDone = Moment().diff(`${match.runDate} ${match.endAt}`) > 0;
      match.isCancel =
        Moment().diff(`${match.runDate} ${match.startAt}`) > 0 &&
        match.selectPeople < match.minPeople;
      return match;
    });
    return coverMatchList;
  }

  async findByStadiumId(params: any, type = ''): Promise<Match[]> {
    const matchList = await this.matchModel
      .find(params)
      .populate('space', { name: 1 }, Space.name)
      .exec();
    if (type) {
      return matchList.filter((match) => this.matchFilter(match, type));
    }
    return matchList;
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
    return await this.matchModel
      .find(params)
      .populate('space', { name: 1 }, Space.name)
      .exec();
  }

  async findById(id: string): Promise<Match> {
    return await this.matchModel.findById(id).exec();
  }

  async addMatch(addMatch: CreateMatchDto): Promise<Match> {
    const { spaceId, startAt, endAt, repeatModel, repeatWeek, runDate } =
      addMatch;
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
      await this.autoAddRepeatMatch(newMatch.toJSON());
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

  async modifyMatch(modifyMatch: ModifyMatchDto): Promise<Match> {
    const { id, spaceId, ...match } = modifyMatch;
    if (!id || !spaceId) {
      ToolsService.fail(`${id ? 'spaceId' : 'id'} 不能为空`);
    }
    const { repeatModel, repeatWeek, runDate } = match;
    const repeatName = this.setRepeatName(repeatModel, repeatWeek, runDate);
    return await this.matchModel
      .findByIdAndUpdate(id, {
        ...match,
        repeatName,
      })
      .exec();
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
    await this.matchModel.findByIdAndUpdate(id, {
      status: false,
    });
  }

  async autoAddRepeatMatch(match) {
    const { id, ...info } = match;
    const { repeatModel, repeatWeek = [] } = info;
    let day = 1;
    while (day <= 6) {
      const runDate = Moment()
        .startOf('day')
        .add(day, 'day')
        .format('YYYY-MM-DD');
      if (repeatModel == 2) {
        const week = Moment(runDate).day();
        if (repeatWeek.includes(week ? week : 7)) {
          const newMatch = new this.matchModel({
            ...info,
            runDate,
            parentId: id,
          });
          await newMatch.save();
        }
      } else if (repeatModel === 3) {
        const newMatch = new this.matchModel({
          ...info,
          runDate,
          parentId: id,
        });
        await newMatch.save();
      }
      day++;
    }
  }
}
