import { Module } from '@nestjs/common';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Stadium } from './stadium.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium])],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}
