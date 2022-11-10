import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shr-button-with-indicator',
  templateUrl: './button-with-indicator.component.html',
  styleUrls: ['./button-with-indicator.component.scss']
})
export class ButtonWithIndicatorComponent {
  @Input() public cssClass?: string;
  @Input() public disabled: boolean = false;
  @Input() public isInProgress: boolean = false;
  @Input() public title = 'SAVE';
  @Input() public stylingMode: 'text' | 'outlined' | 'contained' = 'contained';
  @Input() public type: 'back' | 'danger' | 'default' | 'normal' | 'success' = 'default';
  @Input() public height: string | undefined;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() public onClick: EventEmitter<void> = new EventEmitter();
}
