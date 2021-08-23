import { classToPlain, Exclude, Expose } from 'class-transformer';

export class BaseObjectDto {
  @Expose({ name: 'id' })
  _id: string;

  @Exclude()
  __v: any;

  toJSON() {
    return classToPlain(this);
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
