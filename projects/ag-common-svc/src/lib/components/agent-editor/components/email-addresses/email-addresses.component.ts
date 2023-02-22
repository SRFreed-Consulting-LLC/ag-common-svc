import { Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import {
  ActiveLookup,
  AgentKeys,
  BaseModelKeys,
  EmailAddress,
  Lookup,
  LookupKeys,
  Lookups,
} from 'ag-common-lib/public-api';
import { getFunctions, HttpsCallable, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { LookupsService } from '../../../../services/lookups.service';
import { confirm } from 'devextreme/ui/dialog';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import { AgentEmailAddressesService } from '../../../../services/agent-email-addresses.service';
import { AuthService } from '../../../../services/auth.service';
import { FirebaseApp } from 'firebase/app';
import { FIREBASE_APP } from '../../../../injections/firebase-app';

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
  @Input() agentUID: string;
  @Input() agentEmail: string;
  @Input() isSetAsLoginVisible: boolean = false;
  @Input() emailAddresses: EmailAddress[] = [];
  @Output() emailAddressesChange = new EventEmitter();

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
  private updateUserLoginEmail: HttpsCallable;

  constructor(
    @Inject(FIREBASE_APP) fireBaseApp: FirebaseApp,
    lookupsService: LookupsService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private agentEmailAddressesService: AgentEmailAddressesService,
  ) {
    const functions = getFunctions(fireBaseApp);
    this.updateUserLoginEmail = httpsCallable(functions, 'updateUserLoginEmail');

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
    const emailAddress = e.row.data;
    const email = e.row.data.address;

    const result = await confirm(`<i>Are you sure you want to set "${email}" as Login Email?</i>`, 'Confirm');

    if (!result) {
      return;
    }
    const items = await this.agentEmailAddressesService.findSameUserEmails(email);

    let isEmailExistOnOtherAgent = items.some((item) => item.parentDbId !== this.agentId$.value);
    let isEmailUsedAsLogin = false;

    if (isEmailUsedAsLogin) {
      this.toastrService.error('Same Email Address already used as Login Email.');
      return;
    }

    if (!isEmailExistOnOtherAgent) {
      this.setPrimaryEmailAddress(emailAddress);
      return;
    }

    const prompt = await confirm(
      `<i>Same Email Address exist on other Agent profile.\n Do You continue? </i>`,
      'Warning',
    );
    debugger;
    if (prompt) {
      debugger;
      this.setPrimaryEmailAddress(emailAddress);
    }
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

  private setPrimaryEmailAddress = async (emailAddress: EmailAddress) => {
    try {
      this.updateUserLoginEmail({
        uid: this.agentUID,
        agentDbId: this.agentId$.value,
        emailAddressDbId: emailAddress.dbId,
      }).then((data) => {
        debugger;
      });
    } catch (error) {
      debugger;
    }
    // try {
    //   await this.authService.changeUserEmail(emailAddress.address);
    //   const emailAddresses = await firstValueFrom(this.emailAddresses$);
    //   const loginEmailAddress = emailAddresses.find((item) => item?.is_login);
    //   await Promise.all([
    //     this.agentEmailAddressesService.update(this.agentId$.value, emailAddress.dbId, { is_login: true }),
    //     this.agentEmailAddressesService.update(this.agentId$.value, loginEmailAddress.dbId, { is_login: false }),
    //   ]).then(() => false);
    //   this.toastrService.success(
    //     'Your email is being changed and you will be logged out of the portal\n Please login with your new Email Address.',
    //   );
    // } catch (error) {
    //   debugger;
    // }
  };
}
