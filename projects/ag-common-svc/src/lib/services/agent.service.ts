import { Agent } from 'ag-common-lib/public-api';
import { CommonFireStoreDao } from '../../public-api';
import { DataService } from './data.service';

export class AgentService extends DataService<Agent> {
  constructor(fsDao: CommonFireStoreDao<Agent>) {
    super();
    super.collection = 'agents';
    super.fsDao = fsDao;
  }
}
