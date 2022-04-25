import { BaseModel } from "../base.model";

export class EmailTemplate extends BaseModel {
    name: string;
    subject: string;
    body: string;
}