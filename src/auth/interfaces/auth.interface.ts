import { UserInterface } from '../../users/interfaces/user.interface';

export class AuthInterface {
  token: string;
  authIds: string[];
  userInfo: UserInterface;
}
