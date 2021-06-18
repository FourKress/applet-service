import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
