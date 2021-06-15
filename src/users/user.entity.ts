import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  // 微信openId
  @Column()
  openId: string;

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
}
