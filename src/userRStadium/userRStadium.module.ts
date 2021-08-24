import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRStadiumService } from './userRstadium.service';
import { UserRStadiumController } from './userRstadium.controller';
import {
  UserRStadium,
  UserRStadiumSchema,
} from './schemas/userRStadium.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRStadium.name, schema: UserRStadiumSchema },
    ]),
  ],
  providers: [UserRStadiumService],
  controllers: [UserRStadiumController],
  exports: [UserRStadiumService],
})
export class UserRStadiumModule {}
