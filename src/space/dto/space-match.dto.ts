import { SpaceDto } from './space.dto';

export class SpaceMatchDto extends SpaceDto {
  readonly full: boolean;
  readonly rebate: boolean;
}
