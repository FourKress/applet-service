import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StadiumInterface } from './interfaces/stadium,interface';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { ToolsService } from '../common/interfaces/tools-service';
import { StadiumDto } from './dto/stadium.dto';

@Injectable()
export class StadiumService {
  constructor(
    @InjectModel('Stadium')
    private readonly stadiumModel: Model<StadiumInterface>,
  ) {}

  async findAll(): Promise<StadiumInterface[]> {
    return this.stadiumModel.find().exec();
  }

  async findById(id: string): Promise<StadiumInterface> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.stadiumModel.findById(id).exec();
  }

  async findByBossId(bossId: string): Promise<StadiumInterface[]> {
    if (!bossId) {
      ToolsService.fail('bossId不能为空！');
    }
    return await this.stadiumModel.find({ bossId }).exec();
  }

  async add(addStadium: CreateStadiumDto): Promise<StadiumInterface> {
    const hasStadium = await this.stadiumModel.findOne({
      name: addStadium.name,
    });
    if (hasStadium) {
      ToolsService.fail('添加失败，球场名称已存在！');
    }
    const newStadium = new this.stadiumModel(addStadium);
    return await newStadium.save();
  }

  async modify(modifyStadium: StadiumDto): Promise<StadiumInterface> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.stadiumModel
      .findOneAndUpdate(
        { _id: Types.ObjectId(id) },
        {
          $set: stadiumInfo,
        },
      )
      .exec();
  }
}
