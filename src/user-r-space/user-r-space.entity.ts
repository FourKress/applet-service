import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity()
export class UserRSpace {
  @ObjectIdColumn()
  id: string;

  // 用户Id
  @Column()
  userId: string;

  // 场次Id
  @Column()
  spaceId: string;

  // 是否选中
  @Column()
  isSelect: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
