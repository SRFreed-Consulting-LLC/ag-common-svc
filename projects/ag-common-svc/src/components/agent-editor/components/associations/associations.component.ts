import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import { ActiveLookup, Association, BaseModelKeys, COUNTRIES, LookupKeys, STATES } from 'ag-common-lib/public-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { AgentAssociationsService } from '../../../../lib/services/agent-associations.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import { AssociationFormService } from './association-form.service';
import { DxFormComponent } from 'devextreme-angular';
import { LookupsService } from '../../../../lib/services/lookups.service';

@Component({
  selector: 'ag-shr-associations',
  templateUrl: './associations.component.html',
  styleUrls: ['./associations.component.scss'],
  providers: [AssociationFormService]
})
export class AssociationsComponent {
  @HostBinding('class') className = 'associations';
  @Input() set agentId(value) {
    this.agentId$.next(value);
  }
  @ViewChild('associationModalRef', { static: true }) associationModalComponent: ModalWindowComponent;
  @ViewChild('associationFormRef', { static: false }) associationFormComponent: DxFormComponent;
  @ViewChild('editAssociationModalRef', { static: true }) editAssociationModalComponent: ModalWindowComponent;

  public inProgress$: Observable<boolean>;
  public BaseModelKeys = BaseModelKeys;
  public LookupKeys = LookupKeys;
  public countries = COUNTRIES;
  public states = STATES;
  public associations$: Observable<DataSource>;
  public associationFormData: Association;
  public relationshipTypeLookup$: Observable<ActiveLookup[]>;

  private readonly agentId$ = new BehaviorSubject<string>(undefined);

  constructor(
    private readonly lookupsService: LookupsService,
    private readonly associationFormService: AssociationFormService,
    private readonly agentAssociationsService: AgentAssociationsService
  ) {
    this.relationshipTypeLookup$ = this.lookupsService.associationTypeLookup$;
    this.inProgress$ = this.associationFormService.inProgress$;
    this.associations$ = this.agentId$.pipe(
      filter(Boolean),
      switchMap((agentId: string) => this.agentAssociationsService.getList(agentId)),
      map((associations) => {
        console.log('associations', associations);

        return new DataSource({
          store: new ArrayStore({
            key: 'dbId',
            data: Array.isArray(associations) ? associations : []
          })
        });
      }),
      shareReplay(1)
    );
  }

  public showListPopup = () => {
    this.associationModalComponent.showModal();
  };

  public showAddAssociationPopup = () => {
    this.associationFormData = this.associationFormService.getFormData();
    this.editAssociationModalComponent.showModal();
  };

  public showEditPopup = ({ row: { data } }) => {
    this.associationFormData = this.associationFormService.getFormData(data);
    this.editAssociationModalComponent.showModal();
  };

  public onRowRemoving = (e) => {
    e.cancel = this.agentAssociationsService.delete(this.agentId$.value, e.data[BaseModelKeys.dbId]);
  };

  public onRelationshipTypeSelectionChanged = ({ selectedItem }) => {
    debugger;
    Object.assign(this.associationFormData, { associationTypeRef: selectedItem?.reference ?? null });
  };

  public handleSaveAssociation = (e) => {
    const validationResults = this.associationFormComponent.instance.validate();
    if (validationResults.isValid) {
      this.associationFormService.saveAssociation(this.agentId$.value).then(() => {
        e.component.instance.hide();
      });
    }
  };

  public handleAssociationFormPopupClose = this.associationFormService.onCancelEditAssociation;
}