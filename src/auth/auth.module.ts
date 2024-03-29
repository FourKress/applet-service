import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import AuthConfig from '../config/auth.config';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JWTService } from './jwt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ManagerModule } from '../manager/manager.module';

@Module({
  imports: [
    ConfigModule.forFeature(AuthConfig),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ManagerModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JWTService, JwtStrategy],
})
export class AuthModule {}
