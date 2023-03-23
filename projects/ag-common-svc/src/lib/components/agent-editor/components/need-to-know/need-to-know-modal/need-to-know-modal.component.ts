import { Component, HostBinding, Input, ViewChild } from '@angular/core';
import {
  Agent,
  BaseModelKeys,
  Lookup,
  LookupKeys,
  NeedToKnow,
  NeedToKnowKeys,
  NEED_TO_KNOW_VISIBILITY_LEVEL_LOOKUP
} from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NeedToKnowModalService } from './need-to-know-modal.service';
import { AgentService } from '../../../../../services/agent.service';
import { ModalWindowComponent } from '../../../../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-need-to-know-modal',
  templateUrl: './need-to-know-modal.component.html',
  styleUrls: ['./need-to-know-modal.component.scss'],
  providers: [NeedToKnowModalService]
})
export class NeedToKnowModalComponent {
  @HostBinding('class') className = 'need-to-know-modal';
  @ViewChild('needToKnowModalRef', { static: true }) needToKnowModalComponent: ModalWindowComponent;
  @ViewChild('needToKnowFormRef', { static: false }) needToKnowFormComponent: DxFormComponent;
  @Input() title: string;
  @Input() isVisibilityTypeLocked = false;

  public inProgress$: Observable<boolean>;
  public agentsDataSource$: Observable<any>;
  public BaseModelKeys = BaseModelKeys;
  public NeedToKnowKeys = NeedToKnowKeys;
  public needToKnowVisibilityLevelLookup = NEED_TO_KNOW_VISIBILITY_LEVEL_LOOKUP;
  public needToKnowFormData: NeedToKnow;

  private agentId: string;

  constructor(
    private agentService: AgentService,
    private needToKnowModalService: NeedToKnowModalService
  ) {
    this.inProgress$ = this.needToKnowModalService.inProgress$;

    this.agentsDataSource$ = this.agentService.getList().pipe(
      map((response): Partial<Lookup>[] =>
        Array.isArray(response)
          ? response.map((agent: Agent) => {
              const description = [agent?.p_agent_first_name, agent?.p_agent_last_name].filter(Boolean).join(' ');
              const value = agent?.p_email;

              return {
                key: agent?.dbId,
                [LookupKeys.value]: value,
                [LookupKeys.description]: description
              };
            })
          : []
      )
    );
  }

  public showModal = async (agentId: string, data?: NeedToKnow) => {
    this.agentId = agentId;
    this.needToKnowFormData = await this.needToKnowModalService.getFormData(data);
    this.needToKnowModalComponent?.showModal();
  };

  public handleSaveNeedToKnow = (e) => {
    const validationResults = this.needToKnowFormComponent.instance.validate();
    if (validationResults.isValid) {
      this.needToKnowModalService.saveNeedToKnow(this.agentId).then(() => {
        e.component.instance.hide();
      });
    }
  };

  public handleNeedToKnowFormPopupClose = this.needToKnowModalService.onCancelEditNeedToKnow;
}
