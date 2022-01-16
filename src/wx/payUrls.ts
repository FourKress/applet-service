const wxBaseUrl = 'https://api.mch.weixin.qq.com/v3';

export const payUrls = {
  jsApi: () => {
    return {
      url: `${wxBaseUrl}/pay/transactions/jsapi`,
      method: 'POST',
      pathname: '/v3/pay/transactions/jsapi',
    };
  },
  certificates: () => {
    return {
      url: `${wxBaseUrl}/certificates`,
      method: 'GET',
      pathname: '/v3/certificates',
    };
  },
  refund: () => {
    return {
      url: `${wxBaseUrl}/refund/domestic/refunds`,
      method: 'POST',
      pathname: '/v3/refund/domestic/refunds',
    };
  },
  close: ({ pathParams }) => {
    return {
      url: `${wxBaseUrl}/pay/transactions/out-trade-no/${pathParams.out_trade_no}/close`,
      method: `POST`,
      pathname: `/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}/close`,
    };
  },
  getPayInfo: ({ pathParams }) => {
    return {
      url: `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}?mchid=${pathParams.mchId}`,
      method: `GET`,
      pathname: `/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}?mchid=${pathParams.mchId}`,
    };
  },
  getRefund: ({ pathParams }) => {
    return {
      url: `https://api.mch.weixin.qq.com/v3/refund/domestic/refunds/${pathParams.out_refund_no}`,
      method: `GET`,
      pathname: `/v3/refund/domestic/refunds/${pathParams.out_refund_no}`,
    };
  },
};
