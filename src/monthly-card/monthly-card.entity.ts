import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MonthlyCard {
  @ObjectIdColumn()
  id: string;

  // 用户ID
  @Column()
  userId: string;

  // 球场ID
  @Column()
  stadiumId: string;

  // 有效期开始
  @Column()
  validPeriodStart: string;

  // 有效期结束
  @Column()
  validPeriodEnd: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
