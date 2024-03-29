import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  audience: process.env.AUTH0_AUDIENCE,
  secretOrKey: process.env.JWR_SECRET,
  expiresIn: process.env.JWR_EXPIRES_IN,

  // 微信相关
  wxAppKey: process.env.WX_APP_KEY,
  wxAppSecret: process.env.WX_APP_SECRET,
  wxMchId: process.env.WX_MCH_ID,
  wxSerialNo: process.env.WX_SERIAL_NO,
  wxPayDescription: process.env.WX_PAY_DESCRIPTION,
  wxApiV3Key: process.env.WX_APIV3_KEY,
  wxApiV2Key: process.env.WX_APIV2_KEY,
}));
