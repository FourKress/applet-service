import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: string;

  // 用户Id
  @Column()
  userId: string;

  // 球场Id
  @Column()
  stadiumId: string;

  // 是否关注
  @Column()
  isWatch: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
