import { Module } from '@nestjs/common';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Stadium } from './stadium.entity';

import { UserRelationStadiumModule } from '../user-relation-stadium/user-relation-stadium.module';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium]), UserRelationStadiumModule],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}
