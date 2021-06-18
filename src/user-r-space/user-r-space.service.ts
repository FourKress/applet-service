import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRSpace } from './user-r-space.entity';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class UserRSpaceService {
  constructor(
    @InjectRepository(UserRSpace)
    private readonly userRSpaceRepository: Repository<UserRSpace>,
  ) {}

  async findAll(): Promise<any> {
    return this.userRSpaceRepository.find();
  }

  async relationByUserId(userId: any): Promise<any> {
    console.log(userId);
    if (!userId) {
      return null;
    }
    const relation = await this.userRSpaceRepository.find({
      userId,
    });
    return relation;
  }

  async watch(watchSpace: UserRSpace): Promise<any> {
    console.log(watchSpace);
    const { userId, spaceId } = watchSpace;
    if (!userId || !spaceId) {
      return null;
    }
    const relation = await this.userRSpaceRepository.findOne({
      userId,
      spaceId,
    });
    console.log(relation, 1);
    if (relation) {
      await this.userRSpaceRepository.update(relation.id, watchSpace);
    } else {
      await this.userRSpaceRepository.save({
        ...watchSpace,
        isSelect: true,
      });
    }
    return true;
  }
}
