import { Carrier } from 'ag-common-lib/public-api';
import { CommonFireStoreDao } from '../../public-api';
import { DataService } from './data.service';

export class CarrierService extends DataService<Carrier> {
  constructor(fsDao: CommonFireStoreDao<Carrier>) {
    super();
    super.collection = 'carriers';
    super.fsDao = fsDao;
  }
}
