import { Timestamp } from "@firebase/firestore";

export class BaseModel{
    dbId?: string;
    created_date?: Timestamp;
    created_by?: string;
    updated_date?: Timestamp;
    updated_by?: string;
}