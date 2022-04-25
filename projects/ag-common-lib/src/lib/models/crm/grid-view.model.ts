import { BaseModel } from "../base.model";

export class GridView extends BaseModel {
    type: string;
    name: string;
    filter: any[] = [];
    owner: string;
}