import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRStadiumInterface } from './interfaces/userRStadium.interface';
import { CreateUserRStadiumDto } from './dto/create-userRStadium.dto';

@Injectable()
export class UserRStadiumService {
  constructor(
    @InjectModel('UserRStadium')
    private readonly userRStadium: Model<UserRStadiumInterface>,
  ) {}

  async watchListByUserId(userId: string): Promise<UserRStadiumInterface[]> {
    if (!userId) {
      return null;
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
      return null;
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
      await this.userRStadium.updateOne(
        { _id: Types.ObjectId(relation.id) },
        {
          $set: { isWatch },
        },
      );
      return isWatch;
    }
  }
}
