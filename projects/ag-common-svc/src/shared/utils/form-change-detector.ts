import { Observable, Subject } from 'rxjs';

export enum FormChangesDetectorActionType {
  reset = 'reset',
  fieldChange = 'fieldChange'
}

export interface FormChangesDetectorActionPayload {
  type: FormChangesDetectorActionType;
  path?: string;
  changesMap: Map<string, boolean>;
}

export class FormChangesDetector {
  private readonly changesMap = new Map();

  public actions$: Observable<FormChangesDetectorActionPayload>;
  private _actions$ = new Subject<FormChangesDetectorActionPayload>();

  constructor() {
    this.actions$ = this._actions$.asObservable();
  }

  get hasChanges(): boolean {
    return !!this.changesMap.size;
  }

  public getAllChanges = () => {
    return Array.from(this.changesMap.entries());
  };

  public clearByKeys(keys: string | string[]) {
    if (Array.isArray(keys)) {
      keys.forEach(this.removeByKey);
      return;
    }

    this.removeByKey(keys);
  }

  public clear() {
    this.changesMap.clear();
    this._actions$.next({ type: FormChangesDetectorActionType.reset, changesMap: this.changesMap });
  }

  public getInitialValue = (path: string): any => {
    return this.changesMap.get(path);
  };

  public checkIsFieldChanged = (path: string): boolean => {
    const hasChanges = this.changesMap.has(path);

    return hasChanges;
  };

  public handleChange(key, value, prevValue, compareFunc?: (value, initialValue) => boolean): void {
    if (value === prevValue) {
      return;
    }

    if (this.changesMap.has(key)) {
      const initialValue = this.changesMap.get(key);
      const isEqualToInitial = compareFunc
        ? compareFunc(value, initialValue)
        : initialValue === value || JSON.stringify(initialValue) === JSON.stringify(value) || (!initialValue && !value);
      if (isEqualToInitial) {
        this.changesMap.delete(key);
      }
    } else {
      this.changesMap.set(key, prevValue);
    }

    this._actions$.next({ type: FormChangesDetectorActionType.fieldChange, path: key, changesMap: this.changesMap });
  }

  private removeByKey = (key: string) => {
    this.changesMap.delete(key);
    this._actions$.next({ type: FormChangesDetectorActionType.fieldChange, path: key, changesMap: this.changesMap });
  };
}
