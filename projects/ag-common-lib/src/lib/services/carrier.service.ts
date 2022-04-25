import { Injectable } from '@angular/core';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { Carrier } from '../models/domain/carrier.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class CarrierService extends DataService<Carrier> {
  constructor() {
    super();
    super.collection = 'carriers';
  }

  initialize(fsDao: CommonFireStoreDao<Carrier>){
    super.fsDao = fsDao;
  }
}
