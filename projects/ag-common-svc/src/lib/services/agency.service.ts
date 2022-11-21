import { Inject, Injectable } from '@angular/core';
import { Agency, AGENCY_TYPE } from 'ag-common-lib/public-api';
import { FirebaseApp } from 'firebase/app';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';
import { FIREBASE_APP } from '../injections/firebase-app';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgencyService extends DataService<Agency> {
  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    super(fireBaseApp);
    super.collection = 'agencies';
  }

  getAgencyByAgencyId(id: string): Promise<Agency>{
    return this.getAllByValue([new QueryParam('agency_id', WhereFilterOperandKeys.equal, id)]).then(agentcies => {
      if(agentcies.length == 0){
        return null;
      } else if (agentcies.length == 1){
        return agentcies[0];
      } else {
        console.error("More than 1 agency found with this agency id");
        return null;
      }
    })
  }

  getMGAAgencies(sortField: string): Promise<Agency[]>{
    return this.getAllByValue([new QueryParam('agency_type', WhereFilterOperandKeys.equal, AGENCY_TYPE.MGA)], sortField);
  }
}
