import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Agent,
  AgentKeys,
  AGENT_STATUS,
  ApproveDenyReasonVisibilityLevel,
  BaseModelKeys
} from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { ApproveDenyReason, ApproveDenyReasonKeys } from 'ag-common-lib/lib/models/utils/approve-deny-reason.model';
import { AgentApproveDenyReasonsService } from '../../services/agent-approve-deny-reason.service';
import { LOGGED_IN_USER_EMAIL } from '../agent-editor/agent-editor.model';

export interface ChangeAgentStatusConfig {
  reasonRequired: boolean;
  title: string;
  actionTitle: string;
  agentStatus: AGENT_STATUS;
}

@Injectable()
export class AgentDispositionModalService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>,
    private agentApproveDenyReasonsService: AgentApproveDenyReasonsService
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public save = (agentId) => {
    return Promise.resolve();
  };

  public onCancelEdit = ({ event, component }) => {
    if (!this.formChangesDetector?.hasChanges) {
      return;
    }

    event.cancel = true;

    const result = confirm('<i>Are you sure you want to Cancel without Saving?</i>', 'Confirm');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.formChangesDetector?.clear();
        component.instance.hide();
      }
    });
  };

  public getFormData = (agent?: Agent) => {
    const initialData = Object.assign({}, agent);

    this.formData = new Proxy(initialData, {
      set: (target, prop, value, receiver) => {
        const prevValue = target[prop];
        this.formChangesDetector.handleChange(prop, value, prevValue);
        Reflect.set(target, prop, value, receiver);

        return true;
      }
    });

    return this.formData;
  };
}
