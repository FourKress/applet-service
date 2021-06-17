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

  // 微信openId
  @Column()
  openId: string;

  // 联系电话
  @Column()
  phoneNum: string;

  // 微信昵称
  @Column()
  nickName: string;

  // 区
  @Column()
  city: string;

  // 国家
  @Column()
  country: string;

  // 语言
  @Column()
  language: string;

  // 省
  @Column()
  province: string;

  // 性别 1:男 2:女 0:未知
  @Column()
  gender: number;

  // 头像
  @Column()
  avatarUrl: string;

  // 组队次数
  @Column()
  teamUpCount: string;

  // 是否场主
  @Column()
  isBoss: boolean;

  // 是否月卡
  @Column()
  isMonthlyCard: boolean;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updateAt: string;
}
