import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActiveLookup, AgentKeys, BaseModelKeys, EmailAddress, Lookup, LookupKeys } from 'ag-common-lib/public-api';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { LookupsService } from '../../../../services/lookups.service';
import { confirm } from 'devextreme/ui/dialog';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ag-shr-email-addresses',
  templateUrl: './email-addresses.component.html',
  styleUrls: ['./email-addresses.component.scss'],
  providers: []
})
export class EmailAddressesComponent {
  @Input() agentId: string;
  @Input() agentEmail: string;
  @Input() isSetAsLoginVisible: boolean = false;
  @Input() emailAddresses: EmailAddress[] = [];
  @Output() emailAddressesChange = new EventEmitter();
  @Output() setLoginEmailAddress = new EventEmitter<string>();

  @ViewChild('emailAddressesEditorModalRef', { static: true }) emailAddressesEditorModalComponent: ModalWindowComponent;

  public LookupKeys = LookupKeys;
  public BaseModelKeys = BaseModelKeys;
  public inProgress = false;
  public inProgress$: Observable<boolean>;
  public emailTypeLookup$: Observable<ActiveLookup[]>;

  private defaultEmailTypeLookup: ActiveLookup;

  constructor(
    lookupsService: LookupsService,
    private toastrService: ToastrService,
    private agentService: AgentService
  ) {
    this.emailTypeLookup$ = lookupsService.emailTypeLookup$.pipe(
      tap((items) => {
        this.defaultEmailTypeLookup = items?.find((item) => item?.isDefault);
      })
    );
  }

  public showEmailAddressesEditorModal = () => {
    this.emailAddressesEditorModalComponent.showModal();
  };

  public onEditorPreparing = (e) => {
    this.inProgress = false;
    if (e.parentType !== 'dataRow') {
      return;
    }

    if (e.dataField === 'is_primary') {
      e.editorOptions.disabled = e.row.data.is_primary;
    }

    if (e.dataField === 'is_login') {
      e.editorOptions.disabled = e.row.data.is_login;
    }
  };

  public onInitNewRow = (e) => {
    e.data.is_primary = !this.emailAddresses?.length;
    e.data.is_login = false;
    e.data.email_type = this.defaultEmailTypeLookup?.dbId;
  };

  public onRowInserting = (e) => {
    const { __KEY__: key, ...data } = e?.data;

    const isUniq = this.checkIsEmailAddressUniq(data);

    if (!isUniq) {
      this.toastrService.error('Same Email Address already exists in this profile');

      e.cancel = true;
      return;
    }

    const emailAddresses = this.normalizeEmailAddresses(data);

    emailAddresses.push(Object.assign({ id: key }, data));

    e.cancel = this.updateEmailAddresses(emailAddresses);
  };

  public onRowUpdating = (e) => {
    const data = Object.assign({}, e?.oldData, e?.newData);

    const isUniq = this.checkIsEmailAddressUniq(data, e?.key);

    if (!isUniq) {
      this.toastrService.error('Same Email Address already exists in this profile');

      e.cancel = true;
      return;
    }

    const emailAddresses = this.normalizeEmailAddresses(data, e?.key);

    e.cancel = this.updateEmailAddresses(emailAddresses);
  };

  public onRowRemoving = (e) => {
    const emailAddresses = this.emailAddresses.filter((address) => {
      return address !== e.key;
    });

    e.cancel = this.updateEmailAddresses(emailAddresses);
  };

  public canDeleteEmailAddress = (e) => {
    return !e.row.data.is_primary && !e.row.data.is_login;
  };

  public checkIsSetAsLoginVisible = (e) => {
    return this.isSetAsLoginVisible && !e.row.data.is_login;
  };

  public setLoginEmail = (e) => {
    const emailAddress = e.row.data.address;
    const result = confirm(`<i>Are you sure you want to set "${emailAddress}" as Login Email?</i>`, 'Confirm');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.setLoginEmailAddress.emit(emailAddress);
      }
    });
  };

  private checkIsEmailAddressUniq = (data, key?: EmailAddress) => {
    return this.emailAddresses.every((emailAddress) => {
      if (key && emailAddress === key) {
        return true;
      }

      return data?.number !== emailAddress?.address;
    });
  };

  private normalizeEmailAddresses = (data, key?: EmailAddress) => {
    const isPrimary = data?.is_primary;
    return this.emailAddresses.map((emailAddress) => {
      if (key && emailAddress === key) {
        return data;
      }

      const normalizedEmailAddress = Object.assign({}, emailAddress);
      if (isPrimary) {
        Object.assign(normalizedEmailAddress, { is_primary: false });
      }

      return normalizedEmailAddress;
    });
  };

  private updateEmailAddresses = (emailAddresses) => {
    this.inProgress = true;
    return this.agentService
      .updateFields(this.agentId, { [AgentKeys.email_addresses]: emailAddresses })
      .then(() => {
        this.emailAddresses = emailAddresses;
        this.emailAddressesChange.emit(emailAddresses);
      })
      .finally(() => {
        this.inProgress = false;
      });
  };
}
