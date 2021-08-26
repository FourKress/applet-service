import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSpaceDto } from './dto/create-space.dto';
import { ModifySpaceDto } from './dto/modify-space.dto';
import { SpaceMatchDto } from './dto/space-match.dto';
import { MatchService } from '../match/match.service';
import { ToolsService } from '../common/utils/tools-service';
import { Space, SpaceDocument } from './schemas/space.schema';

@Injectable()
export class SpaceService {
  constructor(
    @InjectModel(Space.name) private readonly spaceModel: Model<SpaceDocument>,
    private readonly matchService: MatchService,
  ) {}

  async findByStadiumId(stadiumId: string): Promise<SpaceMatchDto[]> {
    const spaceList = await this.spaceModel.find({ stadiumId }).exec();
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

  async findById(id: string): Promise<Space> {
    return await this.spaceModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();
  }

  checkNameRepeat(arr) {
    const names = arr.map((d) => d.name);
    const filter = [...new Set(names)];
    return filter.length !== arr.length;
  }

  async addSpace(spaces: CreateSpaceDto[]): Promise<any> {
    if (this.checkNameRepeat(spaces)) {
      ToolsService.fail('场地名称不能重复');
    }
    const notStadiumId = spaces.find((d) => !d.stadiumId);
    const hasSpace = await this.spaceModel
      .find({
        $or: spaces.map((d) => {
          return {
            name: d.name,
            stadiumId: d.stadiumId,
          };
        }),
      })
      .exec();
    if (hasSpace?.length || notStadiumId) {
      ToolsService.fail(
        notStadiumId ? 'stadiumId不能为空！' : '添加失败，场地名称已存在！',
      );
    }
    return await this.spaceModel.insertMany(spaces, {
      ordered: true,
      rawResult: false,
    });
  }

  async modifySpace(spaces: ModifySpaceDto[]): Promise<Space[]> {
    if (this.checkNameRepeat(spaces)) {
      ToolsService.fail('场地名称不能重复');
    }
    const hasSpace = await this.spaceModel
      .find({
        $or: spaces,
      })
      .exec();
    if (hasSpace?.length) {
      ToolsService.fail('修改失败，场地名称已存在！');
    }

    const result = await Promise.all(
      spaces.map(async (space) => {
        const { id = '', ...spaceInfo } = space;
        if (id) {
          return await this.spaceModel.findByIdAndUpdate(id, spaceInfo).exec();
        } else {
          const newSpace = new this.spaceModel(space);
          return await newSpace.save();
        }
      }),
    );
    return result;
  }

  async removeSpace(id: string): Promise<any> {
    return this.spaceModel.findByIdAndDelete(id);
  }
}
