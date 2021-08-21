import { MatchDto } from './match.dto';

export class MatchSpaceDto extends MatchDto {
  isDone: boolean;
  isCancel: boolean;
}
