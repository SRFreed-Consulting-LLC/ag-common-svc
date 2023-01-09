import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { STATES } from 'ag-common-lib/public-api';

@Component({
  selector: 'ag-shr-state-select-box',
  templateUrl: './state-select-box.component.html',
  styleUrls: ['./state-select-box.component.scss']
})
export class StateSelectBoxComponent {
  @HostBinding('class') className = 'state-select-box';
  @Input() readOnly: boolean = false;
  @Input() value: any;
  @Output() valueChange = new EventEmitter();

  public states = STATES;

  constructor() {}
}
