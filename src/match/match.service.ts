import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { CreateMatchDto } from './dto/create-match.dto';
import { ModifyMatchDto } from './dto/modify-match.dto';
import { MatchRunDto } from './dto/match-run.dto';
import { MatchSpaceInterface } from './interfaces/match-space.interface';
import { ToolsService } from '../common/utils/tools-service';
import { RepeatModel, WeekEnum } from '../common/enum/match.enum';
import { Space } from '../space/schemas/space.schema';
import * as nzh from 'nzh/cn';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  async findBySpaceId(params: any): Promise<MatchSpaceInterface[]> {
    const matchList = (await this.matchModel.find(params).exec()).sort(
      (a: any, b: any) => Moment(a.endAt) - Moment(b.endAt),
    );
    const coverMatchList = matchList.map((match) => {
      match.isDone = Moment().diff(`${match.runDate} ${match.endAt}`) > 0;
      match.isCancel =
        Moment().diff(`${match.runDate} ${match.startAt}`) > 0 &&
        match.selectPeople < match.minPeople;
      return match;
    });
    return coverMatchList;
  }

  async findByStadiumId(stadiumId: string, type = 'lt'): Promise<Match[]> {
    const matchList = await this.matchModel
      .find({
        stadiumId,
      })
      .populate('space', { name: 1 }, Space.name)
      .exec();
    return matchList.filter((match) => this.matchFilter(match, type));
  }

  matchFilter(match, type) {
    const time = Moment().startOf('day').diff(match.runDate);
    if (type === 'lt') {
      if (match.repeatModel !== 1 || time < 0) {
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
            return nzh.encodeS(d);
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

  async removeMatch(id: string): Promise<any> {
    await this.matchModel.findByIdAndDelete(id);
  }

  repeatModelEnum() {
    return RepeatModel;
  }

  weekEnum() {
    return WeekEnum;
  }
}
