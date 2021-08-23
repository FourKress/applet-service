import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRStadiumInterface } from './interfaces/userRStadium.interface';
import { CreateUserRStadiumDto } from './dto/create-userRStadium.dto';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class UserRStadiumService {
  constructor(
    @InjectModel('UserRStadium')
    private readonly userRStadium: Model<UserRStadiumInterface>,
  ) {}

  async watchListByUserId(userId: string): Promise<UserRStadiumInterface[]> {
    if (!userId) {
      ToolsService.fail('userId不能为空！');
    }
    return await this.userRStadium
      .find({
        userId,
      })
      .exec();
  }

  async watchFlag(
    stadiumId: string,
    userId: string,
  ): Promise<UserRStadiumInterface> {
    return await this.userRStadium
      .findOne({
        userId,
        stadiumId,
      })
      .exec();
  }

  async watch(
    watchStadium: CreateUserRStadiumDto | UserRStadiumInterface,
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
      await this.userRStadium.findByIdAndUpdate(relation.id, {
        isWatch,
      });
      return isWatch;
    }
  }
}
