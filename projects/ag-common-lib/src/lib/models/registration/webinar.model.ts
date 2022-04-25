import { Timestamp } from "firebase/firestore";
import { BaseModel } from "../base.model";

export class Webinar extends BaseModel{
    name: string;
    start_date: Timestamp;
    end_date: Timestamp;
    url: string;
}