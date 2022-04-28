import { forwardRef, Module } from '@nestjs/common';
import { UserRMatchController } from './userRMatch.controller';
import { UserRMatchService } from './userRMatch.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { UserRMatch, UserRMatchSchema } from './schemas/userRMatch.schema';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRMatch.name, schema: UserRMatchSchema },
    ]),
    UsersModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [UserRMatchController],
  providers: [UserRMatchService],
  exports: [UserRMatchService],
})
export class UserRMatchModule {}
