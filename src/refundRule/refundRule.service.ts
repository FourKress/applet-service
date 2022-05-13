import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefundRuleDocument, RefundRule } from './schemas/space.schema';
import { Model } from 'mongoose';
import { CreateRefundRuleDto } from './dto/create-refundRule.dto';
import { ToolsService } from '../common/utils/tools-service';
import { IRule } from './interfaces/rule.interface';

@Injectable()
export class RefundRuleService {
  constructor(
    @InjectModel(RefundRule.name)
    private readonly refundRuleModel: Model<RefundRuleDocument>,
  ) {}

  async createRules(createRules: CreateRefundRuleDto): Promise<RefundRule> {
    const { stadiumId } = createRules;
    const check = await this.refundRuleModel.find({
      stadiumId,
      validFlag: true,
    });
    if (check?.length) {
      ToolsService.fail('操作失败，已有规则在使用中。');
    }
    const rules = new this.refundRuleModel(createRules);
    return await rules.save();
  }

  async modifyRules(modifyRules): Promise<RefundRule> {
    const { id, ...info } = modifyRules;
    return await this.refundRuleModel.findByIdAndUpdate(id, info).exec();
  }

  async closeRules(refundRuleId): Promise<RefundRule> {
    return await this.refundRuleModel
      .findByIdAndUpdate(refundRuleId, {
        validFlag: false,
      })
      .exec();
  }

  async checkByStadium(stadiumId): Promise<RefundRule> {
    return await this.refundRuleModel
      .findOne({
        stadiumId,
        validFlag: true,
      })
      .exec();
  }

  async getDefault(): Promise<IRule[]> {
    return [
      {
        refundTime: 2,
        refundRatio: 0,
      },
      {
        refundTime: 4,
        refundRatio: 0.5,
      },
      {
        refundTime: 8,
        refundRatio: 0.8,
      },
    ];
  }
}
