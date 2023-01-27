import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Agent, AgentKeys, BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { FormChangesDetector } from '../../../../../shared/utils';
import { pick } from 'lodash';
import { AgentService } from '../../../../services/agent.service';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

@Injectable()
export class PhoneNumbersService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  private agentId: string;

  constructor(private agentService: AgentService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public save = async (modalWindowComponent: ModalWindowComponent) => {
    // const hasChanges = this.formChangesDetector.hasChanges;
    // if (hasChanges) {
    //   this._inProgress$.next(true);
    //   const agentId = this.agentId;
    //   const updates = {};
    //   const changes = this.formChangesDetector.getAllChanges();
    //   changes.forEach(([key]) => {
    //     Object.assign(updates, { [key]: this.formData[key] });
    //   });
    //   await this.agentService
    //     .updateFields(agentId, updates)
    //     .then(() => {
    //       this.formChangesDetector.clear();
    //       modalWindowComponent?.hideModal();
    //     })
    //     .finally(() => {
    //       this._inProgress$.next(false);
    //     });
    //   return { agentId, updates };
    // }
    // if (!hasChanges) {
    //   modalWindowComponent?.hideModal();
    // }
    // return null;
  };

  public onCancel = ({ event, component }) => {
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

        this.formChangesDetector?.clear();
        component.instance.hide();
      }
    });
  };

  public getFormData = (agent?: Partial<Agent>) => {
    this.agentId = agent[BaseModelKeys.dbId];
    const initialData = pick(agent, [AgentKeys.phone_numbers]);

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
