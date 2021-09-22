import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { ModifyUserRMatchDto } from './dto/modify-userRMatch.dto';
import { UserRMatch, UserRMatchDocument } from './schemas/userRMatch.schema';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class UserRMatchService {
  constructor(
    @InjectModel(UserRMatch.name)
    private readonly userRMatchModel: Model<UserRMatchDocument>,
    private readonly usersService: UsersService,
  ) {}

  async findAllByMatchId(matchId: string): Promise<UserRMatch[]> {
    const relationList = await this.userRMatchModel.find({ matchId });
    let personList = [];
    if (relationList.length) {
      personList = await Promise.all(
        relationList.map(async (relation) => {
          const user = await this.usersService.findOneById(relation.userId);
          const userList = new Array(relation.count).fill('').map(() => user);
          return userList;
        }),
      );
      personList = personList.reduce((sum, current) => sum.concat(current));
    }
    return personList;
  }

  relationByUserId(userId: string): any {
    if (!userId) {
      ToolsService.fail('userId不能为空！');
    }
    const relation = this.userRMatchModel.find({
      userId,
    });
    return relation;
  }

  async addRelation(addRelation: CreateUserRMatchDto): Promise<UserRMatch> {
    const { userId, matchId } = addRelation;
    if (!userId || !matchId) {
      ToolsService.fail('userId、matchId不能为空！');
    }
    const relation = await this.userRMatchModel.findOne({
      userId,
      matchId,
    });
    if (relation) {
      const count = relation.count + addRelation.count;
      return this.userRMatchModel.findByIdAndUpdate(relation._id, {
        ...addRelation,
        count,
      });
    }
    const newUserRMatch = new this.userRMatchModel(addRelation);
    return await newUserRMatch.save();
  }

  async modifyRelation(
    modifyRelation: ModifyUserRMatchDto,
  ): Promise<UserRMatch> {
    return this.userRMatchModel.findByIdAndUpdate(
      modifyRelation.id,
      modifyRelation,
    );
  }

  async changeRCount(params: any): Promise<any> {
    const { matchId, ...data } = params;
    await this.userRMatchModel
      .findOneAndUpdate(
        {
          matchId,
        },
        {
          $set: data,
        },
      )
      .exec();
  }
}
