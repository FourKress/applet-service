import { forwardRef, Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchModule } from '../match/match.module';
import { Space, SpaceSchema } from './schemas/space.schema';
import { StadiumModule } from '../stadium/stadium.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Space.name, schema: SpaceSchema }]),
    MatchModule,
    forwardRef(() => StadiumModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
