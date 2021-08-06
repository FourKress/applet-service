import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Revenue {
  @ObjectIdColumn()
  id: string;

  // 今日总收入
  @Column()
  dayTotalAmt: number;

  // 本月总收入
  @Column()
  monthTotalAmt: number;

  // 本月总收入
  @Column()
  walletBalance: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
