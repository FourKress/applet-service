import { Module } from '@nestjs/common';
import { UserRMatchController } from './userRMatch.controller';
import { UserRMatchService } from './userRMatch.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRMatchSchema } from './schemas/userRMatch.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserRMatch', schema: UserRMatchSchema },
    ]),
    UsersModule,
  ],
  controllers: [UserRMatchController],
  providers: [UserRMatchService],
  exports: [UserRMatchService],
})
export class UserRMatchModule {}
