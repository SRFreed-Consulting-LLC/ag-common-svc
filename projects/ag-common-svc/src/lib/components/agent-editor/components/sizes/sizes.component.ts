import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Agent, AgentKeys, BaseModelKeys, Lookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { AgentService } from '../../../../services/agent.service';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { SizesService } from './sizes.service';

@Component({
  selector: 'ag-shr-sizes',
  templateUrl: './sizes.component.html',
  styleUrls: ['./sizes.component.scss'],
  providers: [SizesService]
})
export class SizesComponent {
  @Input('agent') set _agent(value: Agent) {
    this.agent = value;
    this.funStaffFormDetails = this.sizesService.getFormData(value);
  }
  @Output() onFieldsUpdated: EventEmitter<{ agentId: string; updates: Partial<Agent> }> = new EventEmitter();
  @ViewChild('sizeModalRef', { static: true }) sizeModalComponent: ModalWindowComponent;
  @ViewChild('sizeFormRef', { static: false }) sizeFormComponent: DxFormComponent;

  public AgentKeys = AgentKeys;
  public funStaffFormDetails;
  public inProgress$: Observable<boolean>;
  public selectedTShortSize$: BehaviorSubject<Lookup>;
  public selectedUnisexTShortSize$: BehaviorSubject<Lookup>;

  private agent: Agent;

  constructor(private sizesService: SizesService) {
    this.inProgress$ = sizesService.inProgress$;
    this.selectedTShortSize$ = sizesService.selectedTShortSize$;
    this.selectedUnisexTShortSize$ = sizesService.selectedUnisexTShortSize$;
  }

  public saveAgentUpdates = () => {
    const validationResults = this.sizeFormComponent.instance.validate();
    if (validationResults.isValid) {
      const agentId = this.agent[BaseModelKeys.dbId];
      this.sizesService.handleSave(agentId).then((updates) => {
        this.sizeModalComponent.hideModal();
        this.onFieldsUpdated.emit({ agentId, updates });
      });
    }
  };

  public showEditorModal = () => {
    this.sizeModalComponent.showModal();
  };

  public handleClosePopup = (e) => {
    this.sizesService.onCancelEdit(e);
  };

  public handleTShortSizeSelect = (item) => {
    this.selectedTShortSize$.next(item);
  };

  public handleUnisexTShortSizeSelect = (item) => {
    this.selectedUnisexTShortSize$.next(item);
  };
}
