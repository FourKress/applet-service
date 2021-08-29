import { registerAs } from '@nestjs/config';

const userString =
  process.env.MONGODB_USER && process.env.MONGODB_PASS
    ? `${process.env.MONGODB_USER}:${encodeURIComponent(
        process.env.MONGODB_PASS,
      )}@`
    : '';
const authSource = process.env.MONGODB_AUTH_SOURCE
  ? `?authSource=${process.env.MONGODB_AUTH_SOURCE}`
  : '';
export const DBUrl = `mongodb://${userString + process.env.MONGODB_HOST}:${
  process.env.MONGODB_PORT
}/${process.env.MONGODB_DATABASE + authSource}`;

export default registerAs('db', () => ({
  userString,
  authSource,
  dbUrl: DBUrl,
}));
