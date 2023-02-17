import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  ActiveLookup,
  AgentKeys,
  BaseModelKeys,
  EmailAddress,
  Lookup,
  LookupKeys,
  Lookups,
} from 'ag-common-lib/public-api';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { LookupsService } from '../../../../services/lookups.service';
import { confirm } from 'devextreme/ui/dialog';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import { AgentEmailAddressesService } from '../../../../services/agent-email-addresses.service';

@Component({
  selector: 'ag-shr-email-addresses',
  templateUrl: './email-addresses.component.html',
  styleUrls: ['./email-addresses.component.scss'],
  providers: [],
})
export class EmailAddressesComponent {
  @Input() set agentId(value) {
    this.agentId$.next(value);
  }
  @Input() agentEmail: string;
  @Input() isSetAsLoginVisible: boolean = false;
  @Input() emailAddresses: EmailAddress[] = [];
  @Output() emailAddressesChange = new EventEmitter();
  @Output() setLoginEmailAddress = new EventEmitter<string>();

  @ViewChild('emailAddressesEditorModalRef', { static: true }) emailAddressesEditorModalComponent: ModalWindowComponent;

  public Lookups = Lookups;
  public LookupKeys = LookupKeys;
  public BaseModelKeys = BaseModelKeys;
  public inProgress = false;
  public inProgress$: Observable<boolean>;
  public emailTypeLookup$: Observable<ActiveLookup[]>;
  public emailAddresses$: Observable<EmailAddress[]>;
  public emailAddressesDataSource$: Observable<DataSource>;

  private defaultEmailTypeLookup: ActiveLookup;
  private readonly agentId$ = new BehaviorSubject<string>(undefined);

  constructor(
    lookupsService: LookupsService,
    private toastrService: ToastrService,
    private agentService: AgentService,
    private agentEmailAddressesService: AgentEmailAddressesService,
  ) {
    this.emailTypeLookup$ = lookupsService.emailTypeLookup$.pipe(
      tap((items) => {
        this.defaultEmailTypeLookup = items?.find((item) => item?.isDefault);
      }),
    );

    this.emailAddresses$ = this.agentId$.pipe(
      filter(Boolean),
      switchMap((agentId: string) => this.agentEmailAddressesService.getList(agentId)),

      shareReplay(1),
    );

    this.emailAddressesDataSource$ = this.emailAddresses$.pipe(
      map((emailAddresses) => {
        return new DataSource({
          store: new ArrayStore({
            key: 'dbId',
            data: Array.isArray(emailAddresses) ? emailAddresses : [],
          }),
        });
      }),
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

    e.cancel = this.addEmailAddress(data);
  };

  public onRowUpdating = (e) => {
    e.cancel = this.updateEmailAddress(e.key, e?.newData);
  };

  public onRowRemoving = (e) => {
    e.cancel = this.agentEmailAddressesService.delete(this.agentId$.value, e.key);
  };

  public canDeleteEmailAddress = (e) => {
    return !e.row.data.is_primary && !e.row.data.is_login;
  };

  public checkIsSetAsLoginVisible = (e) => {
    return this.isSetAsLoginVisible && !e.row.data.is_login;
  };

  public setLoginEmail = async (e) => {
    const emailAddress = e.row.data.address;
    const result = await confirm(`<i>Are you sure you want to set "${emailAddress}" as Login Email?</i>`, 'Confirm');

    if (!result) {
      return;
    }

    const agentsWithSameEmail = await firstValueFrom(this.agentEmailAddressesService.findSameEmails(emailAddress));

    debugger;

    if (agentsWithSameEmail.some()) {
      this.toastrService.error('Same Email Address already used as Login Email.');
      return;
    }

    // this.setLoginEmailAddress.emit(emailAddress);
  };

  public asyncUniqEmailValidation = async ({ data, value }) => {
    const emailAddresses = await firstValueFrom(this.emailAddresses$);

    return !emailAddresses.some((emailAddress) => emailAddress?.address === value && data?.dbId !== emailAddress?.dbId);
  };

  private addEmailAddress = async (emailAddress: EmailAddress) => {
    const promises = [this.agentEmailAddressesService.create(this.agentId$.value, emailAddress)];

    if (emailAddress?.is_primary) {
      const previousPrimaryEmailAddress = await this.getPrimaryEmailAddress();
      previousPrimaryEmailAddress &&
        promises.push(
          this.agentEmailAddressesService.update(this.agentId$.value, previousPrimaryEmailAddress?.dbId, {
            is_primary: false,
          }),
        );
    }

    return Promise.all(promises).then(() => false);
  };

  private updateEmailAddress = async (documentId: string, emailAddressUpdates: Partial<EmailAddress>) => {
    const promises = [this.agentEmailAddressesService.update(this.agentId$.value, documentId, emailAddressUpdates)];

    if (emailAddressUpdates?.is_primary) {
      const previousPrimaryEmailAddress = await this.getPrimaryEmailAddress();
      previousPrimaryEmailAddress &&
        promises.push(
          this.agentEmailAddressesService.update(this.agentId$.value, previousPrimaryEmailAddress?.dbId, {
            is_primary: false,
          }),
        );
    }

    return Promise.all(promises).then(() => false);
  };

  private getPrimaryEmailAddress = async (): Promise<EmailAddress> => {
    const emailAddresses = await firstValueFrom(this.emailAddresses$);
    const emailAddress = emailAddresses.find((item) => item?.is_primary);

    return emailAddress;
  };
}
