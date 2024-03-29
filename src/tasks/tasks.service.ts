import { Injectable, Logger, HttpService } from '@nestjs/common';
import { Interval, Cron } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import * as utils from '../order/utils';

import { OrderService } from '../order/order.service';
import { MatchService } from '../match/match.service';
import { UsersService } from '../users/users.service';
import { UserRMatchService } from '../userRMatch/userRMatch.service';
import { WxService } from '../wx/wx.service';
import { MonthlyCardService } from '../monthly-card/monthly-card.service';
import { StadiumService } from '../stadium/stadium.service';
import { WxGroupService } from '../wxGroup/wxGroup.service';
import { UnitEnum } from '../common/enum/space.enum';

const Moment = require('moment');
import * as currency from 'currency.js';
import { Types } from 'mongoose';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly orderService: OrderService,
    private readonly matchService: MatchService,
    private readonly userService: UsersService,
    private readonly userRMatchService: UserRMatchService,
    private readonly wxService: WxService,
    private readonly monthlyCardService: MonthlyCardService,
    private readonly stadiumService: StadiumService,
    private readonly wxGroupService: WxGroupService,
    private readonly httpService: HttpService,
  ) {}

  @Cron('0 0 3,13,23 * * *')
  async handleUpdateCertificates() {
    console.log('获取证书');
    await this.wxService.updateCertificates();
  }

  @Cron('0 0 9 * * *')
  async handleStadiumAutoShare() {
    if (process.env.NODE_ENV === 'test') return;
    const wxGroupList = await this.wxGroupService.findActiveList();
    const stadiumIds = wxGroupList.map((wxGroup) => wxGroup.stadiumId);
    const matchList = await this.matchService.findLatelyByStadiumIds(
      stadiumIds,
    );
    const map = stadiumIds.map((id) => {
      const targetList = matchList.filter((m) => m.stadiumId === id);
      const list = targetList.map((m: any) => {
        const match = m.toJSON();
        const space = match.space;
        const unitName = UnitEnum.find((u) => u.value === space.unit).label;
        match.unitName = unitName;
        return match;
      });
      return list;
    });
    await lastValueFrom(
      this.httpService.post(
        'http://150.158.22.228:4927/wechaty/autoShare',
        // 'http://localhost:4927/wechaty/autoShare',
        map,
      ),
    );
    console.log('自动分享触发');
  }

  @Cron('5 0 0 * * *')
  async handleMatch() {
    const matchList: any[] = await this.matchService.findAllBase();
    for (const item of matchList) {
      const match = item.toJSON();
      const { repeatFlag } = match;
      if (!repeatFlag) {
        await this.matchService.autoAddRepeatMatch(match, 'add');
      } else {
        const runDate = Moment().add(13, 'day').format('YYYY-MM-DD');
        await this.matchService.handleRepeatDay(match, runDate, 'add');
      }
    }
  }

  @Cron('2 0 0 * * *')
  async handleMonthlyCard() {
    const monthlyCardList: any[] = await this.monthlyCardService.findAll();
    for (const item of monthlyCardList) {
      const monthlyCard = item.toJSON();
      const { validPeriodEnd, id } = monthlyCard;
      const valid = Moment(validPeriodEnd).add(1, 'day').valueOf();
      const nowTime = Moment.now();
      if (nowTime >= valid) {
        await this.monthlyCardService.changeCardValid(id, false);
      }
    }
  }

  @Interval(1000 * 60 * 1)
  async handleOrderAwait() {
    const orderList: any[] = await this.orderService.findAwaitOrder();
    for (const item of orderList) {
      const nowTime = Moment.now();
      const order = item.toJSON();
      const { status, payAt, id } = order;
      const timerFlag = Moment(nowTime).diff(Moment(payAt), 'seconds') >= 60;
      if (timerFlag) {
        if (status === 5) {
          await this.wxService.getPayInfo(id);
        } else if (status === 4) {
          await this.wxService.getRefund(order.refundId);
        }
      }
    }
  }

  @Interval(1000 * 60 * 3)
  async handleOrderClose() {
    const orderList: any[] = await this.orderService.findCancelOrder();
    for (const item of orderList) {
      const nowTime = Moment.now();
      const order = item.toJSON();
      const { payAt, closeFlag } = order;
      if (
        !closeFlag &&
        payAt &&
        Moment(nowTime).diff(Moment(payAt), 'seconds') >= 5 * 60
      ) {
        await this.wxService.close(order.id);
      }
    }
  }

  @Interval(1000 * 5)
  async handleOrder() {
    const orderList: any[] = await this.orderService.findActiveOrder();
    for (const item of orderList) {
      const order = item.toJSON();
      const { createdAt, status, matchId, personCount, bossId } = order;
      const match = await this.matchService.findById(matchId);
      const {
        selectPeople,
        minPeople,
        runDate,
        startAt,
        endAt,
        chargeModel,
        matchTotalAmt,
        rebatePrice,
      } = match;
      const successPeople = orderList
        .filter((d) => d.matchId === matchId && d.status !== 0)
        .reduce((sum, current) => sum + current.personCount, 0);
      const failMatch = successPeople < minPeople;
      const nowTime = Moment.now();
      const isStart =
        Moment(nowTime).diff(Moment(`${runDate} ${startAt}`), 'seconds') >= 0;
      const isEnd =
        Moment(nowTime).diff(Moment(`${runDate} ${endAt}`), 'seconds') >= 0;
      const realSelectPeople = selectPeople - personCount;

      if (
        status === 0 &&
        ((isStart && failMatch) ||
          Moment(nowTime).diff(Moment(createdAt), 'seconds') >=
            utils.countdown(createdAt, `${runDate} ${startAt}`, 'seconds'))
      ) {
        this.logger.log(`${order.id} 未支付 系统自动取消订单`);
        await this.changeOrder({
          ...order,
          status: 6,
        });
        await this.changeMatch({
          id: matchId,
          selectPeople: realSelectPeople,
        });
        const userId = order.userId;
        const userRMatch = await this.userRMatchService.onlyRelationByUserId(
          matchId,
          userId,
        );
        console.log(userRMatch.count, personCount);
        await this.changeUserRMatch({
          matchId,
          userId,
          count: userRMatch.count - personCount,
        });
      }

      if (status === 1) {
        if (isStart && !isEnd) {
          if (selectPeople < minPeople || failMatch) {
            this.logger.log(`${order.id} 组队失败 触发退款 系统自动取消订单`);
            const refundInfo: any = await this.orderService.handleSystemRefund(
              order.id,
            );
            if (refundInfo.refundAmount === 0) {
              await this.changeOrder({
                ...order,
                status: 3,
              });
              // 组队失败,月卡金额计入钱包余额
              if (refundInfo.newMonthlyCard && refundInfo.monthlyCardPrice) {
                const userInfo = await this.userService.findByBossId(bossId);
                const balanceAmt = currency(userInfo.balanceAmt).add(
                  currency(refundInfo.monthlyCardPrice).value,
                ).value;
                await this.changeBossUser({
                  bossId,
                  balanceAmt,
                  withdrawAt: Moment.now(),
                });
              }
            } else {
              await this.wxService.refund({
                orderId: order.id,
                ...refundInfo,
              });
            }
          } else {
            this.logger.log(`${order.id} 组队成功 进行中`);
            await this.changeOrder({
              ...order,
              status: 7,
            });
          }
        }
      }

      if (status === 7) {
        if (isEnd) {
          this.logger.log(`${order.id} 组队成功 已结束 订单已完成`);
          await this.changeOrder({
            ...order,
            status: 2,
          });
          const userInfo = await this.userService.findByBossId(bossId);
          const balanceAmt = currency(userInfo.balanceAmt).add(
            currency(order.payAmount).subtract(order.compensateAmt).value,
          ).value;
          await this.changeBossUser({
            bossId,
            balanceAmt,
            withdrawAt: Moment.now(),
          });
          await this.userService.setUserTeamUpCount(order.userId);
        } else if (
          Moment(Moment(`${runDate} ${endAt}`)).diff(nowTime, 'seconds') <=
            5 * 60 &&
          !order.isCompensate &&
          order.payAmount !== 0 &&
          chargeModel === 1
        ) {
          const unitPrice = currency(matchTotalAmt).divide(selectPeople).value;
          let refundAmt = 0;
          if (order.payMethod === 1) {
            refundAmt = currency(order.payAmount).subtract(
              unitPrice * personCount,
            ).value;
          } else {
            const realCount = order.personCount - 1;
            const realAmount = currency(order.payAmount).subtract(
              order.payAmount - realCount * rebatePrice,
            ).value;
            const amt = unitPrice * realCount;
            refundAmt = currency(realAmount).subtract(amt).value;
          }
          this.logger.log(`${order.id} 总价退款`);
          console.log(
            selectPeople,
            chargeModel,
            matchTotalAmt,
            unitPrice,
            order.payAmount,
            refundAmt,
          );
          if (refundAmt > 0) {
            await this.changeOrder({
              ...order,
              isCompensate: true,
              compensateAmt: refundAmt,
            });

            this.wxService
              .refund({
                orderId: order.id,
                refundAmount: refundAmt.toFixed(2),
                refundId: Types.ObjectId().toHexString(),
                payAmount: order.payAmount,
                refundType: 1,
              })
              .then(() => {
                console.log(order.id, '平摊模式退款');
              });
          }
        }
      }
    }
  }

  async changeOrder(order) {
    await this.orderService.modifyOrder(order);
  }

  async changeMatch(match) {
    await this.matchService.changeMatchSelectPeople(match);
  }

  async changeUserRMatch(data) {
    await this.userRMatchService.changeRCount(data);
  }

  async changeBossUser(data) {
    await this.userService.setBossBalanceAmt(data);
  }
}
