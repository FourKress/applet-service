export const payUrls = {
  jsapi: () => {
    return {
      url: `https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi`,
      method: 'POST',
      pathname: `/v3/pay/transactions/jsapi`,
    };
  },
  certificates: () => {
    return {
      url: `https://api.mch.weixin.qq.com/v3/certificates`,
      method: 'GET',
      pathname: `/v3/certificates`,
    };
  },
};
