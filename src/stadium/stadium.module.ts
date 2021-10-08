import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Stadium, StadiumSchema } from './schemas/stadium.schema';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';
import { UserRStadiumModule } from '../userRStadium/userRStadium.module';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
const Moment = require('moment');
const { extname, resolve } = require('path');
const fs = require('fs');

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stadium.name, schema: StadiumSchema }]),
    UserRStadiumModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, done) => {
          if (!file) return done(new Error('Upload file error'), null);
          const user = req.user;
          const dir = `./uploads/${user.openId}`;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          return done(null, resolve(process.cwd(), dir));
        },
        filename: (req, file, cb) => {
          console.log(file, req.user, 1111);
          return cb(
            null,
            `${Moment().valueOf()}.${file.mimetype.replace(/[\s\S]+\//, '')}`,
          );
        },
      }),
    }),
  ],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}
