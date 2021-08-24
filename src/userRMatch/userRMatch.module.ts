import { Module } from '@nestjs/common';
import { UserRMatchController } from './userRMatch.controller';
import { UserRMatchService } from './userRMatch.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { UserRMatch, UserRMatchSchema } from './schemas/userRMatch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRMatch.name, schema: UserRMatchSchema },
    ]),
    UsersModule,
  ],
  controllers: [UserRMatchController],
  providers: [UserRMatchService],
  exports: [UserRMatchService],
})
export class UserRMatchModule {}
