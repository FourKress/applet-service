import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schemas/match.schema';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { OrderModule } from '../order/order.module';
import { UserRMatchModule } from '../userRMatch/userRMatch.module';
import { StadiumModule } from '../stadium/stadium.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    forwardRef(() => OrderModule),
    UserRMatchModule,
    forwardRef(() => StadiumModule),
  ],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
