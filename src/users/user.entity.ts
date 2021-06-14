import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  username: string;

  @Column({
    type: 'string',
    length: 150,
    select: false,
    unique: true,
  })
  password: string;

  @Column({ select: false })
  age: number;

  @Column()
  breed: string;
}
