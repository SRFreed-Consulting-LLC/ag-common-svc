import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DxPopupComponent } from 'devextreme-angular';
import { map, Observable } from 'rxjs';
import { DEFAULT_IDLE_TIME_DELAY, idleTimeDelaysLookup } from './idle.model';
import { IdleService } from './idle.service';

@UntilDestroy()
@Component({
  selector: 'ag-shr-idle',
  templateUrl: './idle.component.html',
  styleUrls: ['./idle.component.scss'],
  providers: [IdleService],
})
export class IdleComponent implements OnInit {
  @HostBinding('class') className = 'idle';
  @ViewChild('popupRef', { static: true }) popupComponent: DxPopupComponent;

  public timeoutDelayMinutes = DEFAULT_IDLE_TIME_DELAY;
  public idleTimeDelaysLookup = idleTimeDelaysLookup;

  constructor(private idleService: IdleService) {}

  ngOnInit(): void {
    this.idleService.showNotification$.pipe(untilDestroyed(this)).subscribe((showModal) => {
      showModal ? this.popupComponent.instance.show() : this.popupComponent.instance.hide();
    });
  }

  public handleLogout = () => {};

  public handleStaySighIn = () => {
    this.popupComponent.instance.hide();
    this.idleService.staySighIn(this.timeoutDelayMinutes);
  };
}
