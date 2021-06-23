import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @ObjectIdColumn()
  id: string;

  // 用户ID
  @Column()
  userId: string;

  // 球场ID
  @Column()
  stadiumId: string;

  // 场地ID
  @Column()
  spaceId: string;

  // 场次ID
  @Column()
  matchId: string;

  // 支付金额
  @Column()
  payAmount: string;

  // 是否月卡
  @Column()
  isMonthlyCard: boolean;

  // 人数
  @Column()
  personCount: number;

  @Column()
  status: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
