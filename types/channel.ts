
export interface Channel {
  timeUnixCreated: number;
  timeUnixUpdated: number;
  name: string;
  parent: string;
  children: string[];
}