import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRelationStadium } from './user-relation-stadium.entity';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class UserRelationStadiumService {
  constructor(
    @InjectRepository(UserRelationStadium)
    private readonly userRelationStadiumRepository: Repository<UserRelationStadium>,
  ) {}

  async watchListByUserId(userId: any): Promise<UserRelationStadium[]> {
    if (!userId) {
      return null;
    }
    const watchList = await this.userRelationStadiumRepository.find({
      userId,
    });
    return watchList;
  }

  async watchFlag(data: any): Promise<UserRelationStadium> {
    const { userId, stadiumId } = data;
    const relation = await this.userRelationStadiumRepository.findOne({
      userId,
      stadiumId,
    });
    return relation;
  }

  async watch(watchStadium: UserRelationStadium): Promise<any> {
    const { userId, stadiumId } = watchStadium;
    if (!userId || !stadiumId) {
      return null;
    }
    const { isWatch } = watchStadium;
    const relation = await this.userRelationStadiumRepository.findOne({
      userId,
      stadiumId,
    });
    if (!relation) {
      await this.userRelationStadiumRepository.save({
        ...watchStadium,
        isWatch: true,
      });
      return true;
    } else {
      await this.userRelationStadiumRepository.update(relation.id, {
        isWatch,
      });
      return isWatch;
    }
  }
}
