import { Injectable } from '@angular/core';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { Agency } from 'ag-common-lib';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgencyService extends DataService<Agency> {
  constructor() {    
    super();
    super.collection = "agencies"
  }

  initialize(fsDao: CommonFireStoreDao<Agency>){
    super.fsDao = fsDao;
  }
}
