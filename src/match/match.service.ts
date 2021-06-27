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
    const matchList = (
      await this.matchRepository.find({
        spaceId,
      })
    ).sort((a: any, b: any) => Moment(a.endAt) - Moment(b.endAt));
    return matchList;
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
    const match = await this.matchRepository.save(modifyMatch);
    return match;
  }

  async removeMatch(id: string): Promise<any> {
    await this.matchRepository.delete(id);
  }
}
