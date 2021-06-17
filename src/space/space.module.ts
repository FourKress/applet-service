import { Module } from '@nestjs/common';
import { SpaceController } from './stadium-format.controller';

@Module({
  controllers: [SpaceController],
})
export class SpaceModule {}
