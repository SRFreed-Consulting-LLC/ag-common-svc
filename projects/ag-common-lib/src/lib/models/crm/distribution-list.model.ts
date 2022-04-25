
import { BaseModel } from "../base.model";
import { Agent } from "../domain/agent.model";

export class DistributionList extends BaseModel {
    name: string;
    description: string;
    owner: string;
    to: Agent[] = [];
}