import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Association, BaseModelKeys, LookupKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentAssociationsService } from '../../../../services/agent-associations.service';
import { updateDoc } from 'firebase/firestore';

@Injectable()
export class AssociationFormService {
  public formData: Association;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public selectedTShortSize$ = new BehaviorSubject(null);
  public selectedUnisexTShortSize$ = new BehaviorSubject(null);
  public selectedDietaryConsiderationType$ = new BehaviorSubject(null);

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
          Reflect.set(target, prop, value, receiver);

          switch (prop) {
            case 'p_tshirt_size':
              const prevSelectedTShortSize = this.selectedTShortSize$.value;
              if (prevSelectedTShortSize.value === 'Other') {
                Object.assign(this.formData, { p_tshirt_size_other: null });
              }
              break;
            case 'unisex_tshirt_size':
              const prevUnisexSelectedTShortSize = this.selectedTShortSize$.value;
              if (prevUnisexSelectedTShortSize.value === 'Other') {
                Object.assign(this.formData, { unisex_tshirt_size_other: null });
              }
              break;
            case 'dietary_or_personal_considerations':
              if (prevValue === 'Yes' && value === 'No') {
                Object.assign(this.formData, { dietary_consideration_type: null });
                Object.assign(this.formData, { dietary_consideration: null });
              }
              break;
          }
        }

        return true;
      }
    });

    return this.formData;
  };

  private createAssociation = (agentId) => {
    this._inProgress$.next(true);
    return this.agentAssociationsService
      .create(agentId, this.formData)
      .then(this.onSuccess)
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
      .then(this.onSuccess)
      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };

  private onSuccess = () => {
    const assignedLookups = [
      this.selectedTShortSize$.value,
      this.selectedUnisexTShortSize$.value,
      this.selectedDietaryConsiderationType$?.value
    ];
    const promises = assignedLookups
      .filter((lookup) => lookup && !lookup?.isAssigned)
      .map((lookup) => updateDoc(lookup?.reference, { [LookupKeys.isAssigned]: true }));

    return Promise.all(promises);
  };
}
