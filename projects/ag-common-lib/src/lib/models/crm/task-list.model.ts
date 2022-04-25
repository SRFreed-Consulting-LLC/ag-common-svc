import { BaseModel } from "../base.model";

export class TaskList extends BaseModel{
  name: string;
  entity: string;
  event: string;
  description: string;
}