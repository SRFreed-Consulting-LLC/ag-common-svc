import { Timestamp } from "firebase/firestore";
import { BaseModel } from "../base.model";

export class Contest extends BaseModel{
    name: string;
    start_date: Timestamp;
    end_date: Timestamp;
    location: string;
}