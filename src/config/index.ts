import * as dotenv from 'dotenv-flow';
dotenv.config();

import AppConfig from './app.config';
import AuthConfig from './auth.config';
import DBConfig, { DBUrl } from './db.config';

export const appConfig = AppConfig;
export const authConfig = AuthConfig;
export const dbConfig = DBConfig;
export const dbUrl = DBUrl;
