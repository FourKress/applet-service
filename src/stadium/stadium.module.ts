import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Stadium, StadiumSchema } from './schemas/stadium.schema';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stadium.name, schema: StadiumSchema }]),
  ],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}
