import { Agency } from 'ag-common-lib/public-api';
import { CommonFireStoreDao } from '../../public-api';
import { DataService } from './data.service';

export class AgencyService extends DataService<Agency> {
  constructor(fsDao: CommonFireStoreDao<Agency>) {
    super();
    super.collection = 'agencies';
    super.fsDao = fsDao;
  }
}
