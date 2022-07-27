import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Suggestions, SuggestionsSchema } from './schemas/suggestions.schema';

import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
const Moment = require('moment');
const { resolve, join } = require('path');
const fs = require('fs');

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Suggestions.name, schema: SuggestionsSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, done) => {
          if (!file) return done(new Error('Upload file error'), null);
          const user = req.user;
          const dir = join(__dirname, `../../uploads/${user.openId}`);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          return done(null, resolve(process.cwd(), dir));
        },
        filename: (req, file, cb) => {
          return cb(
            null,
            `${Moment().valueOf()}-suggestions.${file.mimetype
              .replace(/[\s\S]+\//, '')
              .toLowerCase()}`,
          );
        },
      }),
    }),
  ],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
