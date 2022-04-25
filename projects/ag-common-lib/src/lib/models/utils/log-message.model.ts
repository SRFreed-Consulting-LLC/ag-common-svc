import { Timestamp } from "firebase/firestore";
import { BaseModel } from "../base.model";

export class LogMessage extends BaseModel {
    constructor(type: string, created_by: string, message: string,  error_code: string, data?: any){
      super();
      this.type = type;
      this.created_by = created_by;
      this.message = message;
      this.data = data
      this.created_at = Timestamp.now();
      this.error_code = error_code;
    }
  
    dbId: string;
    type: string;
    created_by: string;
    created_at: Timestamp;
    message: string;
    data: any
    error_code: string;
  }