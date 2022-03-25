const crypto = require('crypto');

export const wxBizDataCrypto = (appId, sessionKey, encryptedData, iv) => {
  const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
  const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  try {
    // 解密
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      sessionKeyBuffer,
      ivBuffer,
    );
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return JSON.parse(decoded);
  } catch (err) {
    return '';
  }
};
