import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Agent, AGENT_STATUS, ApproveDenyReasonVisibilityLevel } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';

export interface ChangeAgentStatusConfig {
  reasonRequired: boolean;
  title: string;
  actionTitle: string;
  agentStatus: AGENT_STATUS;
  approveDenyReasonVisibilityLevel: ApproveDenyReasonVisibilityLevel;
}

@Injectable()
export class AgentDispositionModalService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      }),
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
      },
    });

    return this.formData;
  };
}
