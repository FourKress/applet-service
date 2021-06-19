import { Injectable } from '@nestjs/common';
import { Space } from './space.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space) public readonly spaceRepository: Repository<Space>,
  ) {}

  async findByStadiumId(stadiumId: string): Promise<Space[]> {
    const spaceList = await this.spaceRepository.find({ stadiumId });
    return spaceList;
  }

  async findById(id: string): Promise<Space> {
    const space = this.spaceRepository.findOne(id);
    return space;
  }

  async addSpace(info: Space): Promise<Space> {
    const { stadiumId } = info;
    if (!stadiumId) {
      return null;
    }
    const space = await this.spaceRepository.save(info);
    return space;
  }

  async modifySpace(info: Space): Promise<Space> {
    const target = await this.findById(info.id);
    const data = {
      ...target,
      ...info,
      updateAt: Moment().format(),
    };
    const space = await this.spaceRepository.save(data);
    return space;
  }

  async removeSpace(id: string): Promise<any> {
    return this.spaceRepository.delete(id);
  }
}
