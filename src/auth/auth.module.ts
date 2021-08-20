import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import authConfig from '../config/auth.config';
import { AuthController } from './auth.controller';
import { UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { JWTService } from './jwt.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JWTService, JwtStrategy],
})
export class AuthModule {}
