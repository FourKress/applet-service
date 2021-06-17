import { Module } from '@nestjs/common';
import { UserRSpaceController } from './user-r-space.controller';
import { UserRSpaceService } from './user-r-space.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRSpace } from './user-r-space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRSpace])],
  controllers: [UserRSpaceController],
  providers: [UserRSpaceService],
  exports: [UserRSpaceService],
})
export class UserRSpaceModule {}
