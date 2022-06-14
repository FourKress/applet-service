import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema';

@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
    @InjectModel(Manager.name)
    private readonly managerModel: Model<ManagerDocument>,
  ) {}

  async addManager(params): Promise<any> {
    const manager = new this.managerModel(params);
    return await manager.save();
  }
}
