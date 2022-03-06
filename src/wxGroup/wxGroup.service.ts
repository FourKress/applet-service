import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WxGroup, WxGroupDocument } from './schemas/wxGroup.schema';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class WxGroupService {
  constructor(
    @InjectModel(WxGroup.name)
    private readonly wxGroupModel: Model<WxGroupDocument>,
  ) {}

  async findAll(): Promise<WxGroup[]> {
    return await this.wxGroupModel.find().exec();
  }

  async findByWxGroupName(wxGroupName): Promise<WxGroup> {
    return await this.wxGroupModel.findOne({ wxGroupName }).exec();
  }

  async findByStadiumId(stadiumId): Promise<WxGroup> {
    return await this.wxGroupModel.findOne({ stadiumId }).exec();
  }

  async findActiveList(): Promise<WxGroup[]> {
    return await this.wxGroupModel
      .find()
      .exists('bossId', true)
      .exists('stadiumId', true)
      .exec();
  }

  async add(params): Promise<WxGroup> {
    const { wxGroupId } = params;
    const wxGroupFromDB = await this.wxGroupModel.findOne({ wxGroupId });
    if (wxGroupFromDB) {
      const wxGroup = wxGroupFromDB.toJSON();
      await this.modify({
        id: wxGroup.id,
        ...params,
      });
      return;
    }
    const newWxGroup = new this.wxGroupModel(params);
    return await newWxGroup.save();
  }

  async modify(params): Promise<WxGroup> {
    const { id, ...wxGroup } = params;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.wxGroupModel.findByIdAndUpdate(id, wxGroup).exec();
  }
}
