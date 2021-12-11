import { Position } from './position.model';
import { User } from './user.model';

export interface PackageModel {
  id: string;
  packageNumber: string;
  sendDate: Date;
  receiver: User;
  sender: User;
  position: Position;
  comments: string;
  status: PackageStatus;
}

export enum PackageStatus {
  failed = 'Niedostarczona',
  waiting = 'Oczekująca', ///w dystrybucji
  assigned = 'Wydana do dostarczenia', ///jest u kuriera
  inProgress = 'W trakcie dostarczania', ///jest u kuriera jako obecnie dostarczana
  delivered = 'Dostarczona',
}
