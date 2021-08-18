import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stadium } from './stadium.entity';
import { Repository } from 'typeorm';

import { UserRelationStadiumService } from '../user-relation-stadium/user-relation-stadium.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

@Injectable()
export class StadiumService {
  constructor(
    @InjectRepository(Stadium)
    private readonly stadiumRepository: Repository<Stadium>,
    private readonly userRelationStadiumService: UserRelationStadiumService,
  ) {}

  async findAll(): Promise<any> {
    const stadium = await this.stadiumRepository.find();
    return stadium;
  }

  async findById(id: string): Promise<any> {
    if (!id) {
      return null;
    }
    const stadium = await this.stadiumRepository.findOne(id);
    return stadium;
  }

  async add(addStadium: Stadium): Promise<any> {
    const isHas = await this.stadiumRepository.findOne({
      name: addStadium.name,
    });
    if (!isHas) {
      const stadium = await this.stadiumRepository.save(addStadium);
      return stadium;
    }
    return null;
  }

  async modify(modifyStadium: Stadium): Promise<any> {
    const { id, ...stadiumInfo } = modifyStadium;
    if (!id) {
      return null;
    }
    await this.stadiumRepository.update(id, stadiumInfo);
    const stadium = await this.findById(id);
    return stadium;
  }
}
