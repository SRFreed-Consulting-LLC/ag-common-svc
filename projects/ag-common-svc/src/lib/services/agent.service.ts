import { Injectable } from '@angular/core';
import { Agent } from 'ag-common-lib';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends DataService<Agent> {
  constructor() {
    super();
    super.collection = "agents"
  }

  initialize(fsDao: CommonFireStoreDao<Agent>){
    super.fsDao = fsDao;
  }
}
