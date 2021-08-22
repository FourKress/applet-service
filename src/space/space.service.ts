import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSpaceDto } from './dto/create-space.dto';
import { SpaceInterface } from './interfaces/space.interface';
import { SpaceMatchDto } from './dto/space-match.dto';
import { MatchService } from '../match/match.service';
import { Model, Types } from 'mongoose';
import { ToolsService } from '../common/utils/tools-service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class SpaceService {
  constructor(
    @InjectModel('Space') private readonly spaceModel: Model<SpaceInterface>,
    private readonly matchService: MatchService,
  ) {}

  async findByStadiumId(stadiumId: string): Promise<SpaceMatchDto[]> {
    const spaceList = (await this.spaceModel.find({ stadiumId }).exec()).filter(
      (space) =>
        Moment().startOf('day').valueOf() - Moment(space.validateDate) <= 0,
    );
    const coverSpaceList = await Promise.all(
      spaceList.map(async (space) => {
        const match = await this.matchService.findBySpaceId(
          space.id.toString(),
        );
        const full = match.some((m) => m.selectPeople === m.totalPeople);
        const rebate = match.some((m) => m.rebate);
        return {
          ...space,
          full,
          rebate,
        };
      }),
    );
    return coverSpaceList;
  }

  async findById(id: string): Promise<SpaceInterface> {
    return await this.spaceModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();
  }

  async addSpace(info: CreateSpaceDto): Promise<SpaceInterface> {
    const { name, stadiumId } = info;
    const hasSpace = await this.spaceModel.findOne({
      name,
    });
    if (hasSpace || !stadiumId) {
      ToolsService.fail(
        `${stadiumId} ? '添加失败，场地名称已存在！' : 'stadiumId不能为空！'`,
      );
    }

    const newSpace = new this.spaceModel(info);
    return await newSpace.save();
  }

  async modifySpace(info: SpaceInterface): Promise<SpaceInterface> {
    const { id, ...spaceInfo } = info;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.spaceModel.findByIdAndUpdate(id, spaceInfo).exec();
  }

  async removeSpace(id: string): Promise<any> {
    return this.spaceModel.findByIdAndDelete(id);
  }
}
