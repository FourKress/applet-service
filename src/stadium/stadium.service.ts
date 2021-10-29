import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { ToolsService } from '../common/utils/tools-service';
import { Stadium, StadiumDocument } from './schemas/stadium.schema';
import { ModifyStadiumDto } from './dto/modify-stadium.dto';
import { UserRStadiumService } from '../userRStadium/userRstadium.service';
const fs = require('fs');
const path = require('path');

@Injectable()
export class StadiumService {
  constructor(
    @InjectModel(Stadium.name)
    private readonly stadiumModel: Model<StadiumDocument>,
    private readonly userRStadiumService: UserRStadiumService,
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

  async modify(modifyStadium: ModifyStadiumDto, openId): Promise<Stadium> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    const hasStadium = await this.checkName2Id(stadiumInfo.name);
    if (hasStadium !== id) {
      ToolsService.fail('修改失败，球场名称已存在！');
    }
    // const { stadiumUrls } = stadiumInfo;
    // const fileIds = stadiumUrls.map((d) => d.fileId);
    // this.sortOutFileList(openId, fileIds);
    return await this.stadiumModel.findByIdAndUpdate(id, stadiumInfo).exec();
  }

  async waitStartList(userId, search): Promise<Stadium[]> {
    const { type } = search;
    switch (Number(type)) {
      case 1:
        return await this.findAll();
        break;
      case 2:
        const watchList = await this.userRStadiumService.watchListByUserId(
          userId,
        );
        const ids = watchList.map((d: any) => d.stadiumId);
        return await this.stadiumModel.find().in('_id', ids).exec();
      default:
        break;
    }
  }

  sortOutFileList(fileName, fileIds) {
    const filePath = `${path.resolve()}/uploads/${fileName}`;
    fs.readdir(filePath, function (err, files) {
      if (err) {
        console.log('Error', err);
      } else {
        const unFiles = files.filter(
          (f) => !fileIds.includes(f.replace(/.png/g, '')),
        );
        unFiles.map((file) => {
          fs.unlinkSync(`${filePath}/${file}`);
        });
      }
    });
  }

  async uploadFile(files, openId) {
    const { filename } = files[0];
    return {
      path: `/static/${openId}/${filename}`,
      fileId: filename.replace(/.png/g, ''),
    };
  }

  async findByName(name): Promise<Stadium[]> {
    const reg = new RegExp(name, 'i');
    return await this.stadiumModel.find({ name: { $regex: reg } }).exec();
  }
}
