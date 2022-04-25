import { TASK_PRIORITY } from "../../lists/task-priority.enum";
import { TASK_STATUS } from "../../lists/task-status.enum";
import { BaseModel } from "../base.model";

export class Task extends BaseModel{
    listId: string;
    parentId: number;
    owner: string;
    target: string;
    assignedId: string;
    subject: string;
    status: TASK_STATUS;
    priority: TASK_PRIORITY;
    start_date: string;
    due_date: string;
    note?: string;
    order: number;
  }