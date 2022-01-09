import * as CONSTANT from '../constant';

const Moment = require('moment');

export const StatusMap = {
  0: '待付款',
  5: '支付中',
  1: '待开始', // 已支付
  7: '进行中',
  4: '退款中',
  3: '已退款',
  2: '已完成',
  6: '已取消',
  // TODO 订单状态
  8: '支付失败',
  9: '退款失败',
};

export const countdown = (createdAt, startAt, type = 'unix'): number => {
  let awaitTime: number = CONSTANT.orderMinAwaitTime;
  if (
    Moment(startAt).diff(Moment(createdAt), 'minutes') >=
    CONSTANT.orderMaxAwaitTime
  ) {
    awaitTime = CONSTANT.orderMaxAwaitTime;
  }
  const millisecondMap = {
    unix: 60 * 1000,
    seconds: 60,
    minutes: 1,
  };
  return awaitTime * millisecondMap[type];
};
