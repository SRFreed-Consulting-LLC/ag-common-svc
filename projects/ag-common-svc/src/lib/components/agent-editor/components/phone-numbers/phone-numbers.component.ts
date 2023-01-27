import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  Agent,
  AgentKeys,
  AGENT_REVIEW_LEVEL_LOOKUP,
  AGENT_STATUS,
  AGENT_TYPE,
  Lookup,
  PhoneNumber,
  PhoneNumberType,
  PHONE_NUMBER_TYPE_LOOKUP,
  PROSPECT_STATUS
} from 'ag-common-lib/public-api';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-phone-numbers',
  templateUrl: './phone-numbers.component.html',
  styleUrls: ['./phone-numbers.component.scss'],
  providers: []
})
export class PhoneNumbersComponent {
  @Input() agentId: string;
  @Input() phoneNumbers: PhoneNumber[] = [];
  @Output() phoneNumbersChange = new EventEmitter();

  @ViewChild('phoneNumbersEditorModalRef', { static: true }) phoneNumbersEditorModalComponent: ModalWindowComponent;

  public AgentKeys = AgentKeys;
  public PHONE_NUMBER_TYPE_LOOKUP = PHONE_NUMBER_TYPE_LOOKUP;
  public prospectStatuses: PROSPECT_STATUS[] = [];
  public agentStatuses: AGENT_STATUS[] = [];
  public agentTypes: AGENT_TYPE[] = [];
  public agentReviewLevelLookup: Partial<Lookup>[] = AGENT_REVIEW_LEVEL_LOOKUP;
  public roles: any[] = [];
  public inProgress = false;
  public inProgress$: Observable<boolean>;
  public isReviewLevelVisible$: BehaviorSubject<boolean>;

  constructor(private toastrService: ToastrService, private agentService: AgentService) {}

  public showPhoneNumbersEditorModal = () => {
    this.phoneNumbersEditorModalComponent.showModal();
  };

  public onEditorPreparing = (e) => {
    this.inProgress = false;
    if (e.parentType !== 'dataRow') {
      return;
    }

    if (e.dataField === 'is_primary') {
      e.editorOptions.disabled = e.row.data.is_primary;
    }
  };

  public onInitNewRow = (e) => {
    e.data.is_primary = !this.phoneNumbers?.length;
    e.data.is_whatsapp = false;
    e.data.phone_type = PhoneNumberType.Mobile;
  };

  public onRowInserting = (e) => {
    const { __KEY__: key, ...data } = e?.data;

    const isUniq = this.checkIsPhoneNumberUniq(data);

    if (!isUniq) {
      this.toastrService.error('Same Phone Number already exists in this profile');

      e.cancel = true;
      return;
    }

    const phoneNumbers = this.normalizePhoneNumbers(data);

    phoneNumbers.push(Object.assign({ id: key }, data));

    e.cancel = this.updatePhoneNumbers(phoneNumbers);
  };

  public onRowUpdating = (e) => {
    const data = Object.assign({}, e?.oldData, e?.newData);

    const isUniq = this.checkIsPhoneNumberUniq(data, e?.key);

    if (!isUniq) {
      this.toastrService.error('Same address already exists in this profile');

      e.cancel = true;
      return;
    }

    const phoneNumbers = this.normalizePhoneNumbers(data, e?.key);

    e.cancel = this.updatePhoneNumbers(phoneNumbers);
  };

  public onRowRemoving = (e) => {
    const phoneNumbers = this.phoneNumbers.filter((address) => {
      return address !== e.key;
    });

    e.cancel = this.updatePhoneNumbers(phoneNumbers);
  };

  public canDeleteRow = (e) => {
    return !e.row.data.is_primary;
  };

  public uniqPhoneNumberValidationCallback = ({ value }) => {
    return this.phoneNumbers?.every((phoneNumber) => value !== phoneNumber?.number);
  };

  private checkIsPhoneNumberUniq = (data, key?: PhoneNumber) => {
    return this.phoneNumbers.every((phoneNumber) => {
      if (key && phoneNumber === key) {
        return true;
      }

      return data?.number !== phoneNumber?.number;
    });
  };

  private normalizePhoneNumbers = (data, key?: PhoneNumber) => {
    const isPrimary = data?.is_primary;

    return this.phoneNumbers.map((phoneNumber) => {
      if (key && phoneNumber === key) {
        return data;
      }

      const normalizedPhoneNumber = Object.assign({}, phoneNumber);
      if (isPrimary) {
        Object.assign(normalizedPhoneNumber, { is_primary: false });
      }

      return normalizedPhoneNumber;
    });
  };

  private updatePhoneNumbers = (phoneNumbers) => {
    this.inProgress = true;
    return this.agentService
      .updateFields(this.agentId, { [AgentKeys.phone_numbers]: phoneNumbers })
      .then(() => {
        this.phoneNumbersChange.emit(phoneNumbers);
      })
      .finally(() => {
        this.inProgress = false;
      });
  };
}
