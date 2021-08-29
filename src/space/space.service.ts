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
    const matchList = await this.matchService.findByRunData(params);

    const coverSpaceList = spaceList
      .map((space) => {
        const hasMatchList = matchList.filter(
          (d) => d.spaceId === space._id.toHexString(),
        );
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

  checkNameRepeat(spaces) {
    const names = spaces.map((d) => d.name);
    const filter = [...new Set(names)];
    return filter.length !== spaces.length;
  }

  checkStadiumId(spaces) {
    return spaces.some((d) => !d.stadiumId);
  }

  async addSpace(spaces: CreateSpaceDto[]): Promise<any> {
    if (this.checkNameRepeat(spaces)) {
      ToolsService.fail('场地名称不能重复');
    }
    const notStadiumId = this.checkStadiumId(spaces);
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
    if (this.checkStadiumId(spaces)) {
      ToolsService.fail('stadiumId不能为空！');
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
        const { id = Types.ObjectId().toHexString(), ...spaceInfo } = space;
        return await this.spaceModel
          .findByIdAndUpdate(id, spaceInfo, {
            upsert: true,
            rawResult: false,
          })
          .exec();
      }),
    );
    return result;
  }

  async removeSpace(id: string): Promise<any> {
    await this.spaceModel.findByIdAndDelete(id);
  }

  unitEnum() {
    return UnitEnum;
  }
}
