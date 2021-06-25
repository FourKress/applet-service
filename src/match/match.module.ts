import { Module, forwardRef } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { SpaceModule } from '../space/space.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), forwardRef(() => SpaceModule)],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
