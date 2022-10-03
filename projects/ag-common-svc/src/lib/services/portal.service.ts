import { Inject, Injectable } from '@angular/core';
import { PortalData } from 'ag-common-lib/lib/models/utils/portal-data.model';
import { DataService } from './data.service';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root'
})
export class PortalDataService extends DataService<PortalData>{
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp, null, null);
    super.collection = 'portal-data';
  }

  public getPortalData(): Promise<PortalData> {
    return this.fsDao.getById(this.collection, 'data');
  }
  
  public savePortalData(data: PortalData){
    return this.fsDao.update(data, 'data', this.collection);
  }

  public getNextAgentId(): Promise<number>{
    return new Promise(resolve => {
      this.getPortalData().then(data => {
        let portalData: PortalData = data;
        let id: number = portalData.agentId;
        
        portalData.agentId = id + 1;

        this.savePortalData(portalData);

        resolve(id);
      },err => console.error('Error in Portal Service', err))
    })
  }
}
