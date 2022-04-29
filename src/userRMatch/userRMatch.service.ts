import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserRMatchDto } from './dto/create-userRMatch.dto';
import { ModifyUserRMatchDto } from './dto/modify-userRMatch.dto';
import { UserRMatch, UserRMatchDocument } from './schemas/userRMatch.schema';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { ToolsService } from '../common/utils/tools-service';
import { OrderService } from '../order/order.service';

@Injectable()
export class UserRMatchService {
  constructor(
    @InjectModel(UserRMatch.name)
    private readonly userRMatchModel: Model<UserRMatchDocument>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async findAllByMatchId(matchId: string): Promise<UserRMatch[]> {
    const relationList = await this.userRMatchModel.find({ matchId });
    let personList = [];
    if (relationList?.length) {
      personList = await Promise.all(
        relationList.map(async (relation) => {
          const orderList = await this.orderService.findRegistrationFormOrder(
            relation.userId,
            relation.matchId,
          );
          const isMonthlyCardPay = orderList.some((d) => d.payMethod === 2);
          const user: any = orderList[0]?.user;
          user.isMonthlyCardPay = false;
          const count = relation.count < 0 ? 0 : relation.count;
          const userList = Array.from(new Array(count).keys()).map(
            (item, index) => {
              const order: any = orderList[index];
              const orderId = order?._id;
              if (item === 0 && isMonthlyCardPay) {
                return {
                  ...user.toJSON(),
                  isMonthlyCard: true,
                  orderId,
                };
              }
              return { ...user.toJSON(), orderId };
            },
          );
          return userList;
        }),
      );
      personList = personList.reduce((sum, current) => sum.concat(current));
    }
    return personList;
  }

  async relationByUserId(userId: string): Promise<UserRMatch[]> {
    if (!userId) {
      ToolsService.fail('userId不能为空！');
    }
    return await this.userRMatchModel
      .find({
        userId,
      })
      .exec();
  }

  onlyRelationByUserId(matchId: string, userId: string): any {
    if (!userId) {
      ToolsService.fail('userId不能为空！');
    }
    const relation = this.userRMatchModel
      .findOne({
        matchId,
        userId,
      })
      .exec();
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
    const { matchId, userId, ...data } = params;
    await this.userRMatchModel
      .findOneAndUpdate(
        {
          matchId,
          userId,
        },
        {
          $set: data,
        },
      )
      .exec();
  }
}
