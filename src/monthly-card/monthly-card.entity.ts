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

  // 有效期
  @Column()
  validPeriod: string;

  // 球场名称
  @Column()
  stadiumName: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
