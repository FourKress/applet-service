const fs = require('fs');
const crypto = require('crypto');

//生成随机字符串
export const generate = (length = 32) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  const maxPos = chars.length;
  while (length--) str += chars[(Math.random() * maxPos) | 0];
  return str;
};

/**
 * rsa签名
 * @param content 签名内容
 * @param privateKey 私钥，PKCS#1
 * @param hash hash算法，SHA256withRSA，SHA1withRSA
 * @returns 返回签名字符串，base64
 */
export const rsaSign = (signStr) => {
  const cert = fs.readFileSync('./apiclient_key.pem', 'utf-8');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signStr);
  return sign.sign(cert, 'base64');
};
