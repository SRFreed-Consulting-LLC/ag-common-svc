import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseModelKeys, NeedToKnow, NeedToKnowKeys, NeedToKnowVisibilityLevel } from 'ag-common-lib/public-api';
import { map, take } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { LOGGED_IN_USER_EMAIL } from '../../../agent-editor.model';
import { AgentNeedToKnowService } from '../../../../../services/agent-need-to-know.service';

@Injectable()
export class NeedToKnowModalService {
  public formData: NeedToKnow;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Optional() @Inject(LOGGED_IN_USER_EMAIL) private loggedInUserEmail$: Observable<string>,
    private agentNeedToKnowService: AgentNeedToKnowService
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public saveNeedToKnow = (agentId) => {
    return this.formData[BaseModelKeys.dbId]
      ? this.updateNeedToKnow(agentId)
      : this.createNeedToKnow(agentId);
  };

  public onCancelEditNeedToKnow = ({ event, component }) => {
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

  public getFormData = async (association?: Partial<NeedToKnow>) => {
    const loggedInUserEmail = await this.loggedInUserEmail$.pipe(take(1)).toPromise();
    const initialData = Object.assign(
      {
        [BaseModelKeys.createdDate]: new Date(),
        [BaseModelKeys.createdBy]: loggedInUserEmail,
        [NeedToKnowKeys.visibilityLevel]: NeedToKnowVisibilityLevel.AllianceGroupLevel
      },
      new NeedToKnow(),
      association
    );
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

  private createNeedToKnow = (agentId) => {
    this._inProgress$.next(true);
    return this.agentNeedToKnowService
      .create(agentId, this.formData)
      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };

  private updateNeedToKnow = (agentId) => {
    this._inProgress$.next(true);
    return this.agentNeedToKnowService
      .update(agentId, this.formData[BaseModelKeys.dbId], this.formData)
      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };
}
