import * as CONSTANT from '../constant';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Moment = require('moment');

export const StatusMap = {
  0: '待付款',
  1: '待开始',
  2: '已完成',
  3: '已退款',
  4: '退款中',
  5: '支付中',
  6: '已取消',
  7: '进行中',
};
export const getHour = (date) => {
  return date.split(' ')[1];
};

export const countdown = (createdAt, endAt): number => {
  if (
    Moment(endAt).diff(Moment(createdAt), 'minutes') >=
    CONSTANT.orderMaxAwaitTime
  ) {
    return CONSTANT.orderMaxAwaitTime;
  }
  return CONSTANT.orderMinAwaitTime;
};
