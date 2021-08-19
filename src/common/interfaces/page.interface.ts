export enum Order {
  /** 升序  */
  Ascending = 1,
  /** 降序  */
  Descending = -1,
}

export type OrderType = {
  [key: string]: Order;
};

/**
 * 分页参数返回结构
 */

export interface IPageParams {
  current: number;
  pageSize: number;
}

/**
 * 分页装饰器传入参数的结构
 */

export interface IParamsConfig {
  /** 除分页之外需要提取的参数 */
  options?: string[];

  /** 默认排序方式  */
  defaultOrder?: OrderType;

  populate?: object;
}

/**
 * 分页装饰器返回结果结构
 */

export interface IParamsResult {
  pageParams: IPageParams;
  generalParams: {};
  order: OrderType;
  populate: {};
}

/**
 * 分页返回数据接口
 **/
export interface IPager {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
  /** 总条数  */
  total: number;
}

/** 带分页的列表数据类型 */
export interface IPageList<T = any> extends IPager {
  /** 列表数据 */
  records: T[];
}
