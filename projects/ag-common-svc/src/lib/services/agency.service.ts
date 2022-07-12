import { Injectable } from '@angular/core';
import { Agency } from 'ag-common-lib//public-api';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgencyService extends DataService<Agency> {
  constructor() {
    super();
    super.collection = 'agencies';
  }

  initialize(fsDao: CommonFireStoreDao<Agency>) {
    super.fsDao = fsDao;
  }
}
