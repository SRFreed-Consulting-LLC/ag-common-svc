import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActiveLookup, Address, BUSINESS_PERSONAL_TYPE, COUNTRIES } from 'ag-common-lib/public-api';

import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { FullAddressPipe } from '../../../../../shared/pipes/full-address.pipe';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { LookupsService } from '../../../../services/lookups.service';

@Component({
  selector: 'ag-shr-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss'],
  providers: [FullAddressPipe]
})
export class AddressesComponent implements OnInit {
  @ViewChild('addressesModalRef') addressesModalComponent: ModalWindowComponent;
  @ViewChild('addressesGridREf', { static: false }) addressGridComponent: DxDataGridComponent;
  @Input() agentId: string;
  @Input() addresses: Address[] = [];
  @Output() addressesChange = new EventEmitter();

  public inProgress = false;
  public countries = COUNTRIES;
  public businessPersonalTypes: BUSINESS_PERSONAL_TYPE[] = [
    BUSINESS_PERSONAL_TYPE.BUSINESS,
    BUSINESS_PERSONAL_TYPE.PERSONAL
  ];
  public statesLookup$: Observable<ActiveLookup[]>;

  constructor(
    public fullAddressPipe: FullAddressPipe,
    private toastrService: ToastrService,
    private agentService: AgentService,
    private readonly lookupsService: LookupsService
  ) {
    this.statesLookup$ = this.lookupsService.statesLookup$;
  }

  ngOnInit(): void {}

  public onEditorPreparing = (e) => {
    this.inProgress = false;
    if (e.parentType !== 'dataRow') {
      return;
    }

    if (e.dataField === 'is_primary_shipping') {
      e.editorOptions.disabled = e.row.data.is_primary_shipping;
    }
    if (e.dataField === 'is_primary_billing') {
      e.editorOptions.disabled = e.row.data.is_primary_billing;
    }
  };

  public onInitNewRow = (e) => {
    e.data.is_primary_shipping = !this.addresses?.length;
    e.data.is_primary_billing = !this.addresses?.length;
  };

  public onRowInserting = (e) => {
    const { __KEY__: key, ...data } = e?.data;

    const isUniq = this.checkIsAddressUniq(data);

    if (!isUniq) {
      this.toastrService.error('Same address already exists in this profile');

      e.cancel = true;
      return;
    }

    const addresses = this.normalizeAddresses(data);

    addresses.push(Object.assign({ id: key }, data));

    e.cancel = this.updateAddress(addresses);
  };

  public onRowUpdating = (e) => {
    const data = Object.assign({}, e?.oldData, e?.newData);

    const isUniq = this.checkIsAddressUniq(data, e?.key);

    if (!isUniq) {
      this.toastrService.error('Same address already exists in this profile');

      e.cancel = true;
      return;
    }

    const addresses = this.normalizeAddresses(data, e?.key);

    e.cancel = this.updateAddress(addresses);
  };

  public onRowRemoving = (e) => {
    const addresses = this.addresses.filter((address) => {
      return address !== e.key;
    });

    e.cancel = this.updateAddress(addresses);
  };

  public canDeleteRow = (e) => {
    return !e.row.data.is_primary_billing && !e.row.data.is_primary_shipping;
  };

  public onCancel = (e) => {
    this.addressGridComponent?.instance?.cancelEditData();
  };

  private checkIsAddressUniq = (data, key?: Address) => {
    const addressString = this.fullAddressPipe.transform(data);
    return this.addresses.every((address) => {
      if (key && address === key) {
        return true;
      }

      return this.fullAddressPipe.transform(address)?.toLocaleLowerCase() !== addressString?.toLocaleLowerCase();
    });
  };

  private normalizeAddresses = (data, key?: Address) => {
    const isPrimaryBilling = data?.is_primary_billing;
    const isPrimaryShipping = data?.is_primary_shipping;

    return this.addresses.map((address) => {
      if (key && address === key) {
        return data;
      }

      const normalizedAddress = Object.assign({}, address);
      if (isPrimaryBilling) {
        Object.assign(normalizedAddress, { is_primary_billing: false });
      }
      if (isPrimaryShipping) {
        Object.assign(normalizedAddress, { is_primary_shipping: false });
      }

      return normalizedAddress;
    });
  };

  private updateAddress = (addresses) => {
    this.inProgress = true;
    return this.agentService
      .updateFields(this.agentId, { addresses })
      .then(() => {
        this.addressesChange.emit(addresses);
      })
      .finally(() => {
        this.inProgress = false;
      });
  };
}
