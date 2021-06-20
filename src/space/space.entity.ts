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
