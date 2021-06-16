import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { WxModule } from './wx/wx.module';
import { StadiumModule } from './stadium/stadium.module';
import { UserRelationStadiumModule } from './user-relation-stadium/user-relation-stadium.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UsersModule,
    AuthModule,
    WxModule,
    StadiumModule,
    UserRelationStadiumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
