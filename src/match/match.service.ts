import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async findBySpaceId(spaceId: string): Promise<Match[]> {
    const list = await this.matchRepository.find({
      spaceId,
    });
    return list;
  }

  async findById(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne(id);
    return match;
  }

  async addMatch(addMatch: Match): Promise<Match> {
    const match = await this.matchRepository.save({
      ...addMatch,
      rebate: 1,
    });
    return match;
  }

  async removeMatch(id: string): Promise<any> {
    await this.matchRepository.delete(id);
  }
}
