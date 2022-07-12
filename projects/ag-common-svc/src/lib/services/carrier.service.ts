import { Injectable } from '@angular/core';
import { Carrier } from 'ag-common-lib/public-api';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class CarrierService extends DataService<Carrier> {
  constructor() {
    super();
    super.collection = 'carriers';
  }

  initialize(fsDao: CommonFireStoreDao<Carrier>) {
    super.fsDao = fsDao;
  }
}
