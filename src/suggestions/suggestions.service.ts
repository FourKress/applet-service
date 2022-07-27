import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ToolsService } from '../common/utils/tools-service';
import { Suggestions, SuggestionsDocument } from './schemas/suggestions.schema';
import { SuggestionsDto } from './dto/suggestions.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class SuggestionsService {
  private managerInvite: Map<any, any>;

  constructor(
    @InjectModel(Suggestions.name)
    private readonly suggestionsModel: Model<SuggestionsDocument>,
  ) {
    this.managerInvite = new Map();
  }

  async add(suggestions: SuggestionsDto, userId): Promise<Suggestions> {
    const newSuggestions = new this.suggestionsModel({
      ...suggestions,
      user: userId,
    });
    return await newSuggestions.save();
  }

  async findById(id: string): Promise<Suggestions> {
    if (!id) {
      ToolsService.fail('id不能为空！');
    }
    return await this.suggestionsModel.findById(id).exec();
  }

  async findAll(): Promise<Suggestions[]> {
    return this.suggestionsModel
      .find({
        validFlag: true,
        isDelete: false,
      })
      .populate('user', { nickName: 1, avatarUrl: 1 }, User.name)
      .exec();
  }

  async uploadFile(files, openId) {
    const { filename } = files[0];
    return {
      path: `/${openId}/${filename}`,
      fileId: filename.replace(/.(png|jpeg)/g, ''),
    };
  }
}
