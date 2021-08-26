import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
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

  async add(addStadium: CreateStadiumDto): Promise<Stadium> {
    const hasStadium = await this.stadiumModel.findOne({
      name: addStadium.name,
    });
    if (hasStadium) {
      ToolsService.fail('添加失败，球场名称已存在！');
    }
    const newStadium = new this.stadiumModel(addStadium);
    const { _id: stadiumId } = newStadium;
    await this.spaceService.addSpace({
      stadiumId,
      unit: 'testName',
      name: 'testName',
    });
    return await newStadium.save();
  }

  async modify(modifyStadium: ModifyStadiumDto): Promise<Stadium> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.stadiumModel.findByIdAndUpdate(id, stadiumInfo).exec();
  }
}
