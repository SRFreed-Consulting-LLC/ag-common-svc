import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  constructor() {}

  convertFileToDataMapArray(file: File): Promise<Map<string, string>[]>{
    return this.importFileToString(file).then(csvText => {
      return this.createDataMap(csvText);
    })
    
  }

  private importFileToString(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          let text = reader.result;
          resolve(text);
        };
      } catch (err) {
        console.error(err);
      }
    });
  }

  private createDataMap(csvText): Map<string, string>[]{
    let retval: Map<string, string>[] = [];

    let lines: string[] = csvText.split('\n');
    let headers: string[] = lines[0].split(',');

    for (var i = 1; i < lines.length - 1; i++) {
      let data: Map<string, string> = new Map<string, string>();

      for (var j = 0; j < headers.length; j++) {
        let val = lines[i].split(',')[j];
        if(val && val !=''){
          data.set(headers[j], val);
        }
      }

      retval.push(data);
    }

    return retval;
  }
}


