import * as CONSTANT from '../constant';

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
};

export const countdown = (createdAt, startAt, type = 'unix'): number => {
  let awaitTime: number = CONSTANT.orderMinAwaitTime;
  if (
    Moment(startAt).diff(Moment(createdAt), 'minutes') >=
    CONSTANT.orderMaxAwaitTime
  ) {
    awaitTime = CONSTANT.orderMaxAwaitTime;
  }
  if (type === 'unix') {
    return awaitTime * 60 * 1000;
  } else if (type === 'seconds') {
    return awaitTime * 60;
  }
  const millisecondMap = {
    unix: 1000,
    seconds: 1,
  };
  return awaitTime * 60 * millisecondMap[type];
};
