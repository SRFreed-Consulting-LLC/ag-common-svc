import { Prospect } from 'ag-common-lib/public-api';
import { CommonFireStoreDao } from 'ag-common-svc/public-api';

import { DataService } from './data.service';

export class ProspectService extends DataService<Prospect> {
  constructor(fsDao: CommonFireStoreDao<Prospect>) {
    super();
    super.collection = 'prospects';
    super.fsDao = fsDao;
  }
}
