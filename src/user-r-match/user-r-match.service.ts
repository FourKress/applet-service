import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRMatch } from './user-r-match.entity';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class UserRMatchService {
  constructor(
    @InjectRepository(UserRMatch)
    private readonly userRMatchRepository: Repository<UserRMatch>,
  ) {}

  async findAll(): Promise<any> {
    return this.userRMatchRepository.find();
  }

  async relationByUserId(userId: any): Promise<any> {
    console.log(userId);
    if (!userId) {
      return null;
    }
    const relation = await this.userRMatchRepository.find({
      userId,
    });
    return relation;
  }

  async addRelation(addRelation: UserRMatch): Promise<any> {
    console.log(addRelation);
    const { userId, matchId } = addRelation;
    if (!userId || !matchId) {
      return null;
    }
    return this.userRMatchRepository.save(addRelation);
  }
}
