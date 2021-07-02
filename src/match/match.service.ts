import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { SpaceService } from '../space/space.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @Inject(forwardRef(() => SpaceService))
    private readonly spaceService: SpaceService,
  ) {}

  async findBySpaceId(spaceId: string): Promise<any[]> {
    const matchList: Match[] = (
      await this.matchRepository.find({
        spaceId,
      })
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

  async findById(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne(id);
    return match;
  }

  async addMatch(addMatch: Match): Promise<Match> {
    const space = await this.spaceService.findById(addMatch.spaceId);
    const nowDate = space.validateDate;
    const match = await this.matchRepository.save({
      ...addMatch,
      rebate: 1,
      startAt: `${nowDate} ${addMatch.startAt}`,
      endAt: `${nowDate} ${addMatch.endAt}`,
    });
    return match;
  }

  async modifyMatch(modifyMatch: any): Promise<Match> {
    const { id, ...info } = modifyMatch;
    if (!id) {
      return null;
    }
    await this.matchRepository.update(id, info);
    const match = await this.matchRepository.findOne(id);
    return match;
  }

  async removeMatch(id: string): Promise<any> {
    await this.matchRepository.delete(id);
  }
}
