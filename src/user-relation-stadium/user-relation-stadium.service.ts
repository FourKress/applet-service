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

  async watchListByUserId(userId: any): Promise<any> {
    console.log(userId);
    if (!userId) {
      return null;
    }
    const relation = await this.userRelationStadiumRepository.find({
      userId,
    });
    return relation;
  }

  async watchFlag(data: any): Promise<UserRelationStadium> {
    const { userId, stadiumId } = data;
    console.log(userId, stadiumId);
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
    const relation = await this.userRelationStadiumRepository.findOne({
      userId,
      stadiumId,
    });
    console.log(relation, 1, watchStadium);
    if (relation) {
      await this.userRelationStadiumRepository.update(
        relation.id,
        watchStadium,
      );
      return watchStadium.isWatch;
    } else {
      await this.userRelationStadiumRepository.save({
        ...watchStadium,
        isWatch: true,
      });
      return true;
    }
  }
}
