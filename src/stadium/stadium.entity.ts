import {
  Entity,
  Column,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Stadium {
  @ObjectIdColumn()
  id: string;

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
  firstPhoneNum: string;

  // 球场电话
  @Column()
  secondPhoneNum: string;

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

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
