import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectID,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Stadium {
  @ObjectIdColumn()
  id: ObjectID;

  // 球场名称
  @Column()
  name: string;

  // 区
  @Column()
  city: string;

  // 省
  @Column()
  province: string;

  // 国家
  @Column()
  country: string;

  // 球场电话
  @Column()
  phoneNum: string;

  // 球场地址
  @Column()
  address: number;

  // 球场图
  @Column('text')
  stadiumUrl: string;

  // 场地
  @Column()
  remarks: string;

  // 富文本描述
  @Column('text')
  description: string;

  @OneToMany((type) => User, (user) => user.id, {
    eager: true,
  })
  @JoinColumn()
  questions: User[];
}
