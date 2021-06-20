import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
