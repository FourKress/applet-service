import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema';
import { ToolsService } from '../common/utils/tools-service';

@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
    @InjectModel(Manager.name)
    private readonly managerModel: Model<ManagerDocument>,
  ) {}

  async authManager(params, userId): Promise<any> {
    console.log('@@@');
    console.log(JSON.stringify(params), userId);
    console.log('@@@');

    const { stadiumId, boosId } = params;
    const checkByDB = await this.managerModel.findOne({
      stadiumId,
      userId,
      validFlag: true,
    });
    if (checkByDB) {
      ToolsService.fail('您已是该球场的管理员，请不要重复接受邀请');
    }
    const manager = new this.managerModel(params);
    return await manager.save();
  }

  async deleteManager(id: string): Promise<any> {
    await this.managerModel.findByIdAndUpdate(id, {
      validFlag: false,
    });
  }
}
