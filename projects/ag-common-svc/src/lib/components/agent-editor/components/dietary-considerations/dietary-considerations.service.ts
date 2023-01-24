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
export class DietaryConsiderationService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public selectedDietaryConsiderationType$ = new BehaviorSubject(null);

  constructor(private readonly agentService: AgentService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public handleSave = (agentId, modalWindowComponent) => {
    const updates = {};
    const changes = this.formChangesDetector.getAllChanges();

    changes.forEach(([key]) => {
      Object.assign(updates, { [key]: this.formData[key] ?? null });
    });
    this._inProgress$.next(true);
    this.agentService
      .updateFields(agentId, updates)
      .then(() => {
        const selectedDietaryConsiderationType = this.selectedDietaryConsiderationType$?.value;
        if (selectedDietaryConsiderationType && !selectedDietaryConsiderationType?.isAssigned) {
          updateDoc(selectedDietaryConsiderationType?.reference, { [LookupKeys.isAssigned]: true }).then();
        }
        this.formChangesDetector.clear();
        modalWindowComponent?.hideModal();
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
        const changes = this.formChangesDetector.getAllChanges();

        changes.forEach(([key, value]) => {
          Object.assign(this.formData, { [key]: value });
        });
        this.formChangesDetector.clear();
        component.instance.hide();
      }
    });
  };

  public getFormData = (agent?: Partial<Agent>) => {
    const dietaryConsiderationInitialData = pick(agent, [
      AgentKeys.dietary_or_personal_considerations,
      AgentKeys.dietary_consideration_type,
      AgentKeys.dietary_consideration
    ]);
    this.formData = new Proxy(dietaryConsiderationInitialData, {
      set: (target, prop, value, receiver) => {
        const prevValue = target[prop];

        if (value !== prevValue) {
          this.formChangesDetector.handleChange(prop, value, prevValue);
          Reflect.set(target, prop, value, receiver);

          switch (prop) {
            case AgentKeys.dietary_or_personal_considerations:
              if (prevValue === 'Yes' && value === 'No') {
                Object.assign(this.formData, { [AgentKeys.dietary_consideration_type]: null });
                Object.assign(this.formData, { [AgentKeys.dietary_consideration]: null });
              }
              break;
          }
        }

        return true;
      }
    });

    return this.formData;
  };
}
