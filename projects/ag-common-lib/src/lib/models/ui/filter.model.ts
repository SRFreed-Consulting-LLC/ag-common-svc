export class Filter {
    constructor(dataField, dataType, caption?, width?){
      this.caption = caption;
      this.dataField = dataField;
      this.dataType = dataType;
      this.width = width;
    }
  
    caption?: string;
    width?: number;
    dataField: string;
    dataType: string;
    filterOperations: string[] = [ "=", "<>", "<", ">", "<=", ">=" ]
  }