import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './space.entity';

import { MatchModule } from '../match/match.module';

@Module({
  imports: [TypeOrmModule.forFeature([Space]), MatchModule],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
