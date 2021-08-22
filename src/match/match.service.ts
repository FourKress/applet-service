import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchInterface } from './interfaces/match.interface';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchSpaceDto } from './dto/match-space.dto';
import { SpaceService } from '../space/space.service';
import { ToolsService } from '../common/interfaces/tools-service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectModel('Match') private readonly matchModel: Model<MatchInterface>,
    @Inject(forwardRef(() => SpaceService))
    private readonly spaceService: SpaceService,
  ) {}

  async findBySpaceId(spaceId: string): Promise<MatchSpaceDto[]> {
    const matchList: MatchInterface[] = (
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

  async findById(id: string): Promise<MatchInterface> {
    return await this.matchModel.findById(id).exec();
  }

  async addMatch(addMatch: CreateMatchDto): Promise<MatchInterface> {
    const { spaceId, startAt, endAt } = addMatch;
    const hasMatch = await this.matchModel.findOne({
      spaceId,
      startAt,
      endAt,
    });
    if (hasMatch || !spaceId) {
      ToolsService.fail('hasMatch、spaceId不能为空！');
    }

    const space = await this.spaceService.findById(addMatch.spaceId);
    const nowDate = space.validateDate;

    const newMatch = new this.matchModel(addMatch);
    Object.assign(newMatch, {
      rebate: 1,
      startAt: `${nowDate} ${addMatch.startAt}`,
      endAt: `${nowDate} ${addMatch.endAt}`,
    });
    return await newMatch.save();
  }

  async modifyMatch(modifyMatch: MatchInterface): Promise<MatchInterface> {
    const { id, ...match } = modifyMatch;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.matchModel.findByIdAndUpdate(id, match).exec();
  }

  async removeMatch(id: string): Promise<any> {
    await this.matchModel.findByIdAndDelete(id);
  }
}
