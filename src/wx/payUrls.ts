const wxBaseUrl = 'https://api.mch.weixin.qq.com/v3';

export const payUrls = {
  jsApi: () => {
    return {
      url: `${wxBaseUrl}/pay/transactions/jsapi`,
      method: 'POST',
      pathname: `/v3/pay/transactions/jsapi`,
    };
  },
  certificates: () => {
    return {
      url: `${wxBaseUrl}/certificates`,
      method: 'GET',
      pathname: `/v3/certificates`,
    };
  },
};
