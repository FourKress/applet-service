import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { CreateMatchDto } from './dto/create-match.dto';
import { ModifyMatchDto } from './dto/modify-match.dto';
import { MatchSpaceInterface } from './interfaces/match-space.interface';
import { ToolsService } from '../common/utils/tools-service';
import { RepeatModel, WeekEnum } from '../common/enum/match.enum';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  async findBySpaceId(spaceId: string): Promise<MatchSpaceInterface[]> {
    const matchList = (
      await this.matchModel
        .find({
          spaceId,
        })
        .exec()
    ).sort((a: any, b: any) => Moment(a.endAt) - Moment(b.endAt));
    const coverMatchList = matchList.map((match) => {
      return {
        ...match,
        isDone: Moment().diff(match.endAt) > 0,
        isCancel:
          Moment().diff(match.startAt) > 0 &&
          match.selectPeople < match.minPeople,
      };
    });
    return coverMatchList;
  }

  async findByStadiumId(stadiumId: string): Promise<Match[]> {
    return await this.matchModel
      .find({
        stadiumId,
      })
      .populate('Space', { name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Match> {
    return await this.matchModel.findById(id).exec();
  }

  async addMatch(addMatch: CreateMatchDto): Promise<Match> {
    const { spaceId, startAt, endAt, repeatModel } = addMatch;
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
    const repeatName = addMatch.repeatModel
      ? RepeatModel.find((d) => d.value === addMatch.repeatModel).label
      : '';

    const newMatch = new this.matchModel(
      Object.assign({}, addMatch, {
        repeatName,
        spaceName: spaceId,
      }),
    );
    return await newMatch.save();
  }

  async modifyMatch(modifyMatch: ModifyMatchDto): Promise<Match> {
    const { id, spaceId, ...match } = modifyMatch;
    if (!id || !spaceId) {
      ToolsService.fail(`${id ? 'spaceId' : 'id'} 不能为空`);
    }
    return await this.matchModel.findByIdAndUpdate(id, match).exec();
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
