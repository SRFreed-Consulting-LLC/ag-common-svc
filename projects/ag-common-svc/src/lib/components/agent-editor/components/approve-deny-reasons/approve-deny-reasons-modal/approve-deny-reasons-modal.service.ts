import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApproveDenyReasonVisibilityLevel, BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { ApproveDenyReason, ApproveDenyReasonKeys } from 'ag-common-lib/lib/models/utils/approve-deny-reason.model';
import { AgentApproveDenyReasonsService } from '../../../../../services/agent-approve-deny-reason.service';

@Injectable()
export class ApproveDenyReasonModalService {
  public formData: ApproveDenyReason;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(private agentApproveDenyReasonsService: AgentApproveDenyReasonsService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      }),
    );
  }

  public saveApproveDenyReason = (agentId) => {
    return this.formData[BaseModelKeys.dbId]
      ? this.updateApproveDenyReason(agentId)
      : this.createApproveDenyReason(agentId);
  };

  public onCancelEditApproveDenyReason = ({ event, component }) => {
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

  public getFormData = async (association?: Partial<ApproveDenyReason>) => {
    const initialData = Object.assign(
      {
        [ApproveDenyReasonKeys.visibilityLevel]: ApproveDenyReasonVisibilityLevel.AllianceGroupLevel,
      },
      new ApproveDenyReason(),
      association,
    );
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

  private createApproveDenyReason = (agentId) => {
    this._inProgress$.next(true);
    return this.agentApproveDenyReasonsService
      .create(agentId, this.formData)
      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };

  private updateApproveDenyReason = (agentId) => {
    this._inProgress$.next(true);
    return this.agentApproveDenyReasonsService
      .update(agentId, this.formData[BaseModelKeys.dbId], this.formData)
      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };
}
