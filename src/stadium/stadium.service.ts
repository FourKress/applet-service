import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StadiumInterface } from './interfaces/stadium,interface';
import { CreateStadiumDto } from './dto/create-stadium.dto';

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
      return null;
    }
    return await this.stadiumModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();
  }

  async add(addStadium: CreateStadiumDto): Promise<StadiumInterface> {
    const hasStadium = await this.stadiumModel.findOne({
      name: addStadium.name,
    });
    if (hasStadium) {
      return null;
    }
    const newStadium = new this.stadiumModel(addStadium);
    return await newStadium.save();
  }

  async modify(modifyStadium: StadiumInterface): Promise<StadiumInterface> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      return null;
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
