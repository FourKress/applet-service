import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectID,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectID;

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

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at', // mysql数据库规范是使用下划线命名的,不使用驼峰
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updated_at',
    comment: '更新时间',
  })
  updateAt: Date;
}
