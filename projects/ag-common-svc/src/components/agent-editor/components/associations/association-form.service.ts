import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Association, BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentAssociationsService } from '../../../../lib/services/agent-associations.service';

@Injectable()
export class AssociationFormService {
  public formData: Association;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly agentAssociationsService: AgentAssociationsService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public saveAssociation = (agentId) => {
    return this.formData[BaseModelKeys.dbId] ? this.updateAssociation(agentId) : this.createAssociation(agentId);
  };

  public onCancelEditAssociation = ({ event, component }) => {
    console.log('this', this);

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

  public getComparator = (key) => {
    if (key === 'associationTypeRef') {
      return (value, initialValue) => {
        return value?.id === initialValue?.id;
      };
    }

    return undefined;
  };

  public getFormData = (association?: Partial<Association>) => {
    const initialTaskTemplate = Object.assign({}, new Association(), association);
    this.formData = new Proxy(initialTaskTemplate, {
      set: (target, prop, value, receiver) => {
        const prevValue = target[prop];

        const comparator = this.getComparator(prop);
        const isEqualToPrev = comparator ? comparator(value, prevValue) : false;

        if (!isEqualToPrev) {
          this.formChangesDetector.handleChange(prop, value, prevValue, comparator);
        }
        Reflect.set(target, prop, value, receiver);

        return true;
      }
    });

    return this.formData;
  };

  private createAssociation = (agentId) => {
    this._inProgress$.next(true);
    return this.agentAssociationsService
      .create(agentId, this.formData)

      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };

  private updateAssociation = (agentId) => {
    this._inProgress$.next(true);
    return this.agentAssociationsService
      .update(agentId, this.formData[BaseModelKeys.dbId], this.formData)

      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };
}