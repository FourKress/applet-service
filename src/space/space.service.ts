import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSpaceDto } from './dto/create-space.dto';
import { ModifySpaceDto } from './dto/modify-space.dto';
import { SpaceMatchDto } from './dto/space-match.dto';
import { MatchService } from '../match/match.service';
import { ToolsService } from '../common/utils/tools-service';
import { Space, SpaceDocument } from './schemas/space.schema';
import { UnitEnum } from '../common/enum/space.enum';

@Injectable()
export class SpaceService {
  constructor(
    @InjectModel(Space.name) private readonly spaceModel: Model<SpaceDocument>,
    private readonly matchService: MatchService,
  ) {}

  async findByStadiumId(params: any): Promise<SpaceMatchDto[]> {
    const { stadiumId } = params;
    const spaceList = await this.spaceModel.find({ stadiumId }).exec();
    const matchList = await this.matchService.findByRunData({
      ...params,
      status: true,
    });

    const coverSpaceList = spaceList
      .map((item: any) => {
        const space = item.toJSON();
        const hasMatchList = matchList.filter((d) => d.spaceId === space.id);
        if (hasMatchList?.length) {
          const full = hasMatchList.some(
            (m) => m.selectPeople === m.totalPeople,
          );
          const rebate = hasMatchList.some((m) => m.rebate);
          space.full = full;
          space.rebate = rebate;
          return space;
        }
        return null;
      })
      .filter((d) => d);
    return coverSpaceList;
  }

  async dropDownList(stadiumId: string): Promise<Space[]> {
    return await this.spaceModel.find({ stadiumId }).exec();
  }

  async findById(id: string): Promise<Space> {
    return await this.spaceModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();
  }

  checkStadiumId(space) {
    return !space?.stadiumId;
  }

  async addSpace(space: CreateSpaceDto): Promise<Space> {
    const notStadiumId = this.checkStadiumId(space);
    const hasSpace = await this.spaceModel.findOne(space).exec();
    if (hasSpace || notStadiumId) {
      ToolsService.fail(
        notStadiumId ? 'stadiumId不能为空！' : '添加失败，场地名称已存在！',
      );
    }
    const newSpace = new this.spaceModel(space);
    return await newSpace.save();
  }

  async modifySpace(space: ModifySpaceDto): Promise<Space> {
    const { id, ...data } = space;
    if (this.checkStadiumId(space)) {
      ToolsService.fail('stadiumId不能为空！');
    }
    const hasSpace = await this.spaceModel.findOne(data).exec();
    if (hasSpace) {
      ToolsService.fail('修改失败，场地名称已存在！');
    }
    return await this.spaceModel.findByIdAndUpdate(id, data).exec();
  }

  async removeSpace(id: string): Promise<any> {
    await this.spaceModel.findByIdAndDelete(id);
  }

  unitEnum() {
    return UnitEnum;
  }
}
