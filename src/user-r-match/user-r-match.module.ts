import { Module } from '@nestjs/common';
import { UserRMatchController } from './user-r-match.controller';
import { UserRMatchService } from './user-r-match.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRMatch } from './user-r-match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRMatch])],
  controllers: [UserRMatchController],
  providers: [UserRMatchService],
  exports: [UserRMatchService],
})
export class UserRMatchModule {}
