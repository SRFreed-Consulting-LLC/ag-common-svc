import { Injectable } from '@angular/core';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';
import { Agent } from '../models/domain/agent.model';
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
