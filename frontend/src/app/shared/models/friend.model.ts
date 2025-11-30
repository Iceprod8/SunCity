import { User } from './user.model';

export interface Friend {
  id: string | number;
  ownerId: string | number;
  friendUserId: string | number;
  note?: string;
  user?: User;
}

export type FriendRecord = {
  id: string | number;
  ownerId: string | number;
  friendUserId: string | number;
  note?: string;
};