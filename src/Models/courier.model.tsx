import { PackageModel } from './package.model';
import { Position } from './position.model';
import { Region } from './region.model';

export interface Courier {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: number;
  startPosition: Position | undefined;
  vehicle: string;
  registration: string;
  startTime: string;
  region: Region | undefined;
  deliveredPackages: PackageModel[];
  undeliveredPackages: PackageModel[];
  currentPackages: PackageModel | undefined;
}
