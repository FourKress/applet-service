import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Space {
  @ObjectIdColumn()
  id: string;

  // 场地Id
  @Column()
  spaceId: string;

  // 时长
  @Column()
  duration: number;

  // 时间段
  @Column()
  runAt: string;

  // 总人数
  @Column()
  totalPeople: number;

  // 已选人数
  @Column()
  selectPeople: number;

  // 折扣
  @Column()
  rebate: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
