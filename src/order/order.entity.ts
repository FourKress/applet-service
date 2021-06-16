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

  // 支付金额
  @Column()
  payAmount: string;

  // 是否月卡
  @Column()
  isMonthlyCard: boolean;

  // 球场名称
  @Column()
  stadiumName: string;

  // 人数
  @Column()
  personCount: number;

  @Column()
  status: number;

  // 场地信息
  @Column()
  remarks: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
