export class CreateMatchDto {
  // 场地Id
  readonly spaceId: string;
  // 时长
  readonly duration: number;
  // 开始时间
  readonly startAt: string;
  // 结束时间
  readonly endAt: string;
  // 总人数
  readonly totalPeople: number;
  // 已选人数
  readonly selectPeople: number;
  // 最小人数
  readonly minPeople: number;
  // 折扣
  readonly rebate: number;
  // 单价
  readonly price: number;
}
