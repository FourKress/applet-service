import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { UserRMatchInterface } from './interfaces/userRMatch.interface';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';

@Injectable()
export class UserRMatchService {
  constructor(
    @InjectModel('UserRMatch')
    private readonly userRMatchModel: Model<UserRMatchInterface>,
    private readonly usersService: UsersService,
  ) {}

  async findAllByMatchId(matchId: string): Promise<UserRMatchInterface[]> {
    const relationList = await this.userRMatchModel.find({ matchId });
    let personList = [];
    if (relationList.length) {
      personList = await Promise.all(
        relationList.map(async (relation: UserRMatchInterface) => {
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

  async relationByUserId(userId: string): Promise<UserRMatchInterface[]> {
    if (!userId) {
      return null;
    }
    const relation = await this.userRMatchModel.find({
      userId,
    });
    return relation;
  }

  async addRelation(
    addRelation: CreateUserRMatchDto,
  ): Promise<UserRMatchInterface> {
    const { userId, matchId } = addRelation;
    if (!userId || !matchId) {
      return null;
    }
    const relation = await this.userRMatchModel.findOne({
      userId,
      matchId,
    });
    if (relation) {
      const count = relation.count + addRelation.count;
      return this.userRMatchModel.findByIdAndUpdate(relation.id, {
        ...addRelation,
        count,
      });
    }
    const newUserRMatch = new this.userRMatchModel(addRelation);
    return await newUserRMatch.save();
  }

  async modifyRelation(
    modifyRelation: UserRMatchInterface,
  ): Promise<UserRMatchInterface> {
    console.log(modifyRelation);
    return this.userRMatchModel.findByIdAndUpdate(
      modifyRelation.id,
      modifyRelation,
    );
  }
}
