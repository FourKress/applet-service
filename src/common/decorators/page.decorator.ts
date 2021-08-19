import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  IParamsConfig,
  IParamsResult,
  Order,
} from '../interfaces/page.interface';
import * as _ from 'lodash';

export const Page = createParamDecorator(
  (customConfig: IParamsConfig, ctx: ExecutionContext): IParamsResult => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const pageParams = {
      current: Number(query.current || 1),
      pageSize: Number(query.pageSize || 10),
    };
    let generalParams = {};
    let order = {};
    let populate = {};

    if (_.isObject(customConfig)) {
      if (_.isArray(customConfig?.options)) {
        customConfig.options.forEach((key) => {
          console.log(query[key]);

          if (!_.isUndefined(query[key]) && query[key] !== '') {
            generalParams[key] = query[key];
          }
        });
      }
    }
    if (_.isObject(customConfig?.defaultOrder)) {
      order = customConfig.defaultOrder;
    }

    if (_.isObject(customConfig?.populate)) {
      populate = customConfig.populate;
    }

    if (query.orderby && _.isString(query.orderby)) {
      const orderValue = Number(query.orderValue);
      const verifyValue = _.includes(
        [Order.Ascending, Order.Descending],
        orderValue,
      );
      if (verifyValue) {
        order = {
          [query.orderby]: orderValue,
        };
      }
    }

    return { pageParams, generalParams, order, populate };
  },
);
