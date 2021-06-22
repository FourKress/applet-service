import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRMatch } from './user-r-match.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class UserRMatchService {
  constructor(
    @InjectRepository(UserRMatch)
    private readonly userRMatchRepository: Repository<UserRMatch>,
    private readonly usersService: UsersService,
  ) {}

  async findAllByMatchId(matchId: string): Promise<any> {
    const relationList = await this.userRMatchRepository.find({ matchId });
    let personList = [];
    if (relationList.length) {
      personList = await Promise.all(
        relationList.map(async (relation: UserRMatch) => {
          const user = await this.usersService.findOneById(relation.userId);
          const userList = new Array(relation.count)
            .fill('')
            .map((item) => user);
          return userList;
        }),
      );
      personList = personList.reduce((sum, current) => sum.concat(current));
    }
    return personList;
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
