import { Module } from '@nestjs/common';
import { UserRelationStadiumService } from './user-relation-stadium.service';
import { UserRelationStadiumController } from './user-relation-stadium.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRelationStadium } from './user-relation-stadium.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRelationStadium])],
  providers: [UserRelationStadiumService],
  controllers: [UserRelationStadiumController],
  exports: [UserRelationStadiumService],
})
export class UserRelationStadiumModule {}
