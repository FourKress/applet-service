import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StadiumSchema } from './schemas/stadium.schema';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Stadium', schema: StadiumSchema }]),
  ],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}
