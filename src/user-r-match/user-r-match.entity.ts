import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserRMatch {
  @ObjectIdColumn()
  id: string;

  // 用户Id
  @Column()
  userId: string;

  // 人数
  @Column()
  count: number;

  // 比赛Id
  @Column()
  matchId: string;

  // 场次Id
  @Column()
  spaceId: string;

  // 球场Id
  @Column()
  stadiumId: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
