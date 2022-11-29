import { Pipe, PipeTransform } from '@angular/core';
import { AGENT_STATUS, ApproveDenyReasonVisibilityLevel } from 'ag-common-lib/public-api';
import { ModalWindowComponent } from '../modal-window/modal-window.component';
import { AgentDispositionModalService, ChangeAgentStatusConfig } from './agent-disposition-modal.service';

@Pipe({ name: 'agentDispositionModalControls' })
export class AgentDispositionModalControlsPipe implements PipeTransform {
  constructor(private agentDispositionModalService: AgentDispositionModalService) {}

  transform(
    agentStatus: AGENT_STATUS,
    approveDenyReasonVisibilityLevel: ApproveDenyReasonVisibilityLevel,
    handleChangeAgentStatusClick: (changeAgentStatusConfig: ChangeAgentStatusConfig) => void
  ): any[] {
    return [
      {
        widget: 'dxButton',
        location: 'before',
        toolbar: 'bottom',
        visible: agentStatus !== AGENT_STATUS.APPROVED,
        options: {
          text: 'APPROVE AGENT',
          type: 'success',
          onClick: () => {
            const changeAgentStatusConfig: ChangeAgentStatusConfig = {
              reasonRequired: false,
              title: 'Approve Agent',
              actionTitle: 'APPROVE',
              approveDenyReasonVisibilityLevel,
              agentStatus: AGENT_STATUS.APPROVED
            };
            handleChangeAgentStatusClick(changeAgentStatusConfig);
          },
          elementAttr: {
            class: 'agency-management__toolbar-button'
          }
        }
      },
      {
        widget: 'dxButton',
        location: 'before',
        toolbar: 'bottom',
        visible: agentStatus !== AGENT_STATUS.INACTIVE,
        options: {
          text: 'DEACTIVATE AGENT',
          type: 'default',
          onClick: () => {
            const changeAgentStatusConfig: ChangeAgentStatusConfig = {
              reasonRequired: true,
              title: 'Deactivate Agent',
              actionTitle: 'DEACTIVATE',
              approveDenyReasonVisibilityLevel,
              agentStatus: AGENT_STATUS.INACTIVE
            };
            handleChangeAgentStatusClick(changeAgentStatusConfig);
          },
          elementAttr: {
            class: 'agency-management__toolbar-button'
          }
        }
      },
      {
        widget: 'dxButton',
        location: 'before',
        toolbar: 'bottom',
        visible: agentStatus !== AGENT_STATUS.DENIED,
        options: {
          text: 'Deny AGENT',
          type: 'danger',
          onClick: () => {
            const changeAgentStatusConfig: ChangeAgentStatusConfig = {
              reasonRequired: true,
              title: 'Deny Agent',
              actionTitle: 'DENY',
              approveDenyReasonVisibilityLevel,
              agentStatus: AGENT_STATUS.DENIED
            };
            handleChangeAgentStatusClick(changeAgentStatusConfig);
          },
          elementAttr: {
            class: 'agency-management__toolbar-button'
          }
        }
      }
    ];
  }
}
