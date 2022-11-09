import { Directive, Output, HostListener, EventEmitter } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Directive({
  selector: '[multipleClick]',
  exportAs: 'meetingLogAttendees',
})
export class MultipleClickDirective {
  @Output() singleClick = new EventEmitter();
  @Output() doubleClick = new EventEmitter();

  private readonly delay = 200;
  private timeout;
  private isSingleClickAborted;

  @HostListener('click', ['$event']) onClick(e) {
    this.isSingleClickAborted = false;
    this.timeout = setTimeout(() => {
      if (!this.isSingleClickAborted) {
        this.singleClick.emit(e);
      }
    }, this.delay);
  }

  @HostListener('dblclick', ['$event']) onDoubleClick(e) {
    this.isSingleClickAborted = true;
    clearTimeout(this.timeout);
    this.doubleClick.emit(e);
  }

  constructor() {}
}
