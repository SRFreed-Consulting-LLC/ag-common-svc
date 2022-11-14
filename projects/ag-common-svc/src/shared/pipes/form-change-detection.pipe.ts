import { Inject, InjectionToken, Pipe, PipeTransform } from '@angular/core';
import {
  CallLogKeys,
  EmailLogKeys,
  MeetingLogKeys,
  PhysicalLocationKeys,
  NoteLogKeys,
  TaskKeys
} from 'ag-common-lib/public-api';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import {
  FormChangesDetector,
  FormChangesDetectorActionPayload,
  FormChangesDetectorActionType
} from 'ag-common-svc/shared/utils';

export const FORM_CHANGE_DETECTOR = new InjectionToken<FormChangesDetector>('formChangeDetector');

@Pipe({ name: 'formChangeDetection' })
export class FormChangeDetectionPipe implements PipeTransform {
  private readonly changesSubject = new BehaviorSubject<boolean>(false);

  constructor(@Inject(FORM_CHANGE_DETECTOR) private formChangeDetector: FormChangesDetector) {}

  transform(
    path:
      | MeetingLogKeys
      | PhysicalLocationKeys
      | EmailLogKeys
      | CallLogKeys
      | NoteLogKeys
      | TaskKeys
      | Array<MeetingLogKeys | PhysicalLocationKeys | EmailLogKeys | CallLogKeys | NoteLogKeys | TaskKeys>
  ): Observable<boolean> {
    this.changesSubject.next(
      Array.isArray(path)
        ? path.some(this.formChangeDetector.checkIsFieldChanged)
        : this.formChangeDetector.checkIsFieldChanged(path)
    );
    this.formChangeDetector.actions$
      .pipe(
        filter((payload) => {
          if (payload.type === FormChangesDetectorActionType.reset) {
            return true;
          }

          return Array.isArray(path) ? path.some((subpath) => subpath === payload.path) : path === payload.path;
        }),
        map((payload: FormChangesDetectorActionPayload) => {
          const checkIsFieldChanged = (subpath) => payload.changesMap.has(subpath);

          const hasChanges = Array.isArray(path) ? path.some(checkIsFieldChanged) : checkIsFieldChanged(path);

          return hasChanges;
        })
      )
      .subscribe((hasChanges) => {
        this.changesSubject.next(hasChanges);
      });

    return this.changesSubject;
  }
}
