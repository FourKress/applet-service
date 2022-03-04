import { Module } from '@nestjs/common';
import { WxGroupController } from './wxGroup.controller';
import { WxGroupService } from './wxGroup.service';
import { WxGroup, WxGroupSchema } from './schemas/wxGroup.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WxGroup.name, schema: WxGroupSchema }]),
  ],
  controllers: [WxGroupController],
  providers: [WxGroupService],
  exports: [WxGroupService],
})
export class WxGroupModule {}
