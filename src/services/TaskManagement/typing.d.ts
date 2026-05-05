import type { Priority, Status } from './constant';

export interface ITask {
  id: string;
  name: string;
  description: string;
  deadline: string;
  priority: Priority;
  status: Status;
  tags?: string[];
}