import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Agent, AgentKeys, LookupKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentService } from '../../../../services/agent.service';
import { updateDoc } from 'firebase/firestore';

@Injectable()
export class SizesService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public selectedTShortSize$ = new BehaviorSubject(null);
  public selectedUnisexTShortSize$ = new BehaviorSubject(null);

  constructor(private readonly agentService: AgentService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public handleSave = (agentId, modalWindowComponent) => {
    debugger;
    const updates = {};
    const changes = this.formChangesDetector.getAllChanges();

    changes.forEach(([key]) => {
      Object.assign(updates, { [key]: this.formData[key] ?? null });
    });
    this._inProgress$.next(true);
    this.agentService
      .updateFields(agentId, updates)
      .then(() => {
        debugger;
        const selectedTShortSize = this.selectedTShortSize$.value;
        const selectedUnisexTShortSize = this.selectedUnisexTShortSize$.value;
        if (!selectedTShortSize?.isAssigned) {
          updateDoc(selectedTShortSize?.reference, { [LookupKeys.isAssigned]: true }).then();
        }
        if (!selectedUnisexTShortSize?.isAssigned) {
          updateDoc(selectedUnisexTShortSize?.reference, { [LookupKeys.isAssigned]: true }).then();
        }
        debugger;
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
        this.formChangesDetector?.clear();
        component.instance.hide();
      }
    });
  };

  public getFormData = (agent?: Partial<Agent>) => {
    const funStaffInitialData = {
      [AgentKeys.p_tshirt_size]: agent[AgentKeys.p_tshirt_size],
      [AgentKeys.p_tshirt_size_other]: agent[AgentKeys.p_tshirt_size_other],
      [AgentKeys.unisex_tshirt_size]: agent[AgentKeys.unisex_tshirt_size],
      [AgentKeys.unisex_tshirt_size_other]: agent[AgentKeys.unisex_tshirt_size_other],
      [AgentKeys.shoe_size]: agent[AgentKeys.shoe_size],
      [AgentKeys.hobbies]: agent[AgentKeys.hobbies],
      [AgentKeys.favorite_destination]: agent[AgentKeys.favorite_destination]
    };
    this.formData = new Proxy(funStaffInitialData, {
      set: (target, prop, value, receiver) => {
        const prevValue = target[prop];

        switch (prop) {
          case AgentKeys.p_tshirt_size:
            const prevSelectedTShortSize = this.selectedTShortSize$.value;
            if (prevSelectedTShortSize.value === 'Other') {
              const prevValueOtherSize = target[AgentKeys.p_tshirt_size_other];
              Reflect.set(target, AgentKeys.p_tshirt_size_other, null, receiver);
              this.formChangesDetector.handleChange(AgentKeys.p_tshirt_size_other, null, prevValueOtherSize);
            }
            break;
          case AgentKeys.unisex_tshirt_size:
            const prevValueUnisexOtherSize = target[AgentKeys.unisex_tshirt_size_other];
            const prevUnisexSelectedTShortSize = this.selectedTShortSize$.value;
            if (prevUnisexSelectedTShortSize.value === 'Other') {
              Reflect.set(target, AgentKeys.unisex_tshirt_size_other, null, receiver);
              this.formChangesDetector.handleChange(AgentKeys.unisex_tshirt_size_other, null, prevValueUnisexOtherSize);
            }
            break;
        }

        this.formChangesDetector.handleChange(prop, value, prevValue);
        Reflect.set(target, prop, value, receiver);

        return true;
      }
    });

    return this.formData;
  };
}
