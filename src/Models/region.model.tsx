import { Position } from './position.model';

export interface Region {
  name: string;
  leftTop: Position;
  leftBottom: Position;
  rightTop: Position;
  rightBottom: Position;
}
