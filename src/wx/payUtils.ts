const fs = require('fs');
const path = require('path');
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
  const cert = fs.readFileSync(
    path.resolve(__dirname, '../../apiclient_key.pem'),
    'utf-8',
  );
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signStr);
  return sign.sign(cert, 'base64');
};

export const decode = (resource, wxApiV3Key) => {
  try {
    const AUTH_KEY_LENGTH = 16;
    const { ciphertext, associated_data, nonce } = resource;
    const key_bytes = Buffer.from(wxApiV3Key, 'utf8');
    const nonce_bytes = Buffer.from(nonce, 'utf8');
    const associated_data_bytes = Buffer.from(associated_data, 'utf8');
    const ciphertext_bytes = Buffer.from(ciphertext, 'base64');
    const cipherData_length = ciphertext_bytes.length - AUTH_KEY_LENGTH;
    const cipherData_bytes = ciphertext_bytes.slice(0, cipherData_length);
    const auth_tag_bytes = ciphertext_bytes.slice(
      cipherData_length,
      ciphertext_bytes.length,
    );
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key_bytes,
      nonce_bytes,
    );
    decipher.setAuthTag(auth_tag_bytes);
    decipher.setAAD(Buffer.from(associated_data_bytes));

    const output = Buffer.concat([
      decipher.update(cipherData_bytes),
      decipher.final(),
    ]);
    return output.toString();
  } catch (e) {
    console.log(e);
    return false;
  }
};
