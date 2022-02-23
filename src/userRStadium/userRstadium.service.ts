import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ModifyUserRStadiumDto } from './dto/modify-userRStadium.dto';
import { CreateUserRStadiumDto } from './dto/create-userRStadium.dto';
import { ToolsService } from '../common/utils/tools-service';
import {
  UserRStadium,
  UserRStadiumDocument,
} from './schemas/userRStadium.schema';

@Injectable()
export class UserRStadiumService {
  constructor(
    @InjectModel(UserRStadium.name)
    private readonly userRStadium: Model<UserRStadiumDocument>,
  ) {}

  async watchListByUserId(userId: string): Promise<UserRStadium[]> {
    if (!userId) {
      ToolsService.fail('userId不能为空！');
    }
    return await this.userRStadium
      .find({
        userId,
        isWatch: true,
      })
      .exec();
  }

  async watchFlag(stadiumId: string, userId: string): Promise<UserRStadium> {
    return await this.userRStadium
      .findOne({
        userId,
        stadiumId,
      })
      .exec();
  }

  async watch(
    watchStadium: CreateUserRStadiumDto | ModifyUserRStadiumDto,
  ): Promise<boolean> {
    const { userId, stadiumId } = watchStadium;
    if (!userId || !stadiumId) {
      ToolsService.fail('userId、stadiumId不能为空！');
    }
    const { isWatch } = watchStadium;
    const relation = await this.userRStadium
      .findOne({
        userId,
        stadiumId,
      })
      .exec();
    if (!relation) {
      const newWatch = new this.userRStadium({
        ...watchStadium,
        isWatch: true,
      });
      await newWatch.save();
      return true;
    } else {
      const id = relation.toJSON().id;
      await this.userRStadium.findByIdAndUpdate(id, {
        isWatch,
      });
      return isWatch;
    }
  }
}
