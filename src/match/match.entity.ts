import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Match {
  @ObjectIdColumn()
  id: string;

  // 场地Id
  @Column()
  spaceId: string;

  // 时长
  @Column()
  duration: number;

  // 开始时间
  @Column()
  startAt: string;

  // 结束时间
  @Column()
  endAt: string;

  // 总人数
  @Column()
  totalPeople: number;

  // 已选人数
  @Column()
  selectPeople: number;

  @Column()
  minPeople: number;

  // 折扣
  @Column()
  rebate: number;

  // 单价
  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
