import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { ToolsService } from '../common/utils/tools-service';
import { Stadium, StadiumDocument } from './schemas/stadium.schema';
import { ModifyStadiumDto } from './dto/modify-stadium.dto';
import { SpaceService } from '../space/space.service';

@Injectable()
export class StadiumService {
  constructor(
    @InjectModel(Stadium.name)
    private readonly stadiumModel: Model<StadiumDocument>,
    private readonly spaceService: SpaceService,
  ) {}

  async findAll(): Promise<Stadium[]> {
    return this.stadiumModel.find().exec();
  }

  async findById(id: string): Promise<Stadium> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.stadiumModel.findById(id).exec();
  }

  async findByBossId(bossId: string): Promise<Stadium[]> {
    if (!bossId) {
      ToolsService.fail('bossId不能为空！');
    }
    return await this.stadiumModel.find({ bossId }).exec();
  }

  async checkName2Id(name: string): Promise<string> {
    const hasStadium = await this.stadiumModel
      .findOne({
        name,
      })
      .exec();
    const id = hasStadium?._id;
    if (id) {
      return Types.ObjectId(id).toHexString();
    }
    return '';
  }

  async add(addStadium: CreateStadiumDto): Promise<Stadium> {
    const { name } = addStadium;
    if (await this.checkName2Id(name)) {
      ToolsService.fail('添加失败，球场名称已存在！');
      return;
    }
    const newStadium = new this.stadiumModel(addStadium);
    return await newStadium.save();
  }

  async modify(modifyStadium: ModifyStadiumDto): Promise<Stadium> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    const hasStadium = await this.checkName2Id(stadiumInfo.name);
    if (hasStadium !== id) {
      ToolsService.fail('修改失败，球场名称已存在！');
    }
    return await this.stadiumModel.findByIdAndUpdate(id, stadiumInfo).exec();
  }
}
