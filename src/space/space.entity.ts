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

  // 球场Id
  @Column()
  stadiumId: string;

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

  // 场次名称
  @Column()
  name: string;

  // 5V5
  @Column()
  unit: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
