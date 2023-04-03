import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormChangesDetector } from 'ag-common-svc/shared/utils';
import { map } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';

export enum BaseFormActions {
  created = 'created',
  updated = 'updated',
  fieldsUpdated = 'fieldsUpdated'
}

export class BaseFormService<T> {
  public formData: T;
  public hasFormChanges$: Observable<boolean>;

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public actions$: Observable<BaseFormActions>;
  private _actions$ = new Subject<BaseFormActions>();

  constructor() {
    this.inProgress$ = this._inProgress$.asObservable();
    this.actions$ = this._actions$.asObservable();

    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  /**
   * @return {Boolean} Returns true in case data resets
   */
  public onCancelEdit = async (onAfterRevertChanges?: () => void) => {
    if (!this.formChangesDetector?.hasChanges) {
      return true;
    }

    const isConfirmed = await confirm('<i>Are you sure you want to Cancel without Saving?</i>', 'Confirm');

    if (isConfirmed) {
      this.revertAllChanges();
      onAfterRevertChanges && onAfterRevertChanges();
    }

    return isConfirmed;
  };

  protected revertAllChanges = () => {
    const changes = this.formChangesDetector.getAllChanges();
    changes.forEach(([key, value]) => {
      Object.assign(this.formData, { [key]: value });
    });
    this.formChangesDetector.clear();
  };

  protected startProgress() {
    this._inProgress$.next(true);
  }

  protected stopProgress() {
    this._inProgress$.next(false);
  }

  protected onSuccessfulCreated() {
    this.formChangesDetector.clear();
    this._actions$.next(BaseFormActions.created);
  }

  protected onSuccessfulUpdated(updatedFields: string[]) {
    this.formChangesDetector.clearByKeys(updatedFields);
    this._actions$.next(BaseFormActions.updated);
  }
}
