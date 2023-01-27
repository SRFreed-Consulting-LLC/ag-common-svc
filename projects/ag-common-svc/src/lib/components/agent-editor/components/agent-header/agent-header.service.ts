import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Agent, AgentKeys, LookupKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentService } from '../../../../services/agent.service';
import { updateDoc } from 'firebase/firestore';
import { pick } from 'lodash';

@Injectable()
export class AgentHeaderService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly agentService: AgentService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public handleSave = (agentId) => {
    const updates = {};
    const changes = this.formChangesDetector.getAllChanges();

    changes.forEach(([key]) => {
      Object.assign(updates, { [key]: this.formData[key] ?? null });
    });
    this._inProgress$.next(true);
    this.agentService
      .updateFields(agentId, updates)
      .then(() => {
        this.formChangesDetector.clear();

        return updates;
      })

      .finally(() => {
        this._inProgress$.next(false);
      });
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

  public getFormData = (agent?: Partial<Agent>) => {
    const initialData = pick(agent, [
      AgentKeys.p_prefix,
      AgentKeys.p_agent_first_name,
      AgentKeys.p_agent_middle_name,
      AgentKeys.p_agent_last_name,
      AgentKeys.p_suffix,
      AgentKeys.p_headshot_link,
      AgentKeys.title,
      AgentKeys.p_mga_id,
      AgentKeys.p_agency_id,
      AgentKeys.addresses,
      AgentKeys.email_addresses,
      AgentKeys.phone_numbers
    ]);
    console.log('initialData', initialData);
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
