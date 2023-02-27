import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { LookupsService } from '../../services';

@Component({
  selector: 'ag-shr-gender-select-box',
  templateUrl: './gender-select-box.component.html',
  styleUrls: ['./gender-select-box.component.scss']
})
export class GenderSelectBoxComponent {
  @HostBinding('class') className = 'gender-select-box';
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = 'Gender';
  @Input() labelMode: 'static' | 'floating' | 'hidden' = 'floating';
  @Input() value: any;
  @Output() valueChange = new EventEmitter();
  @Output() selectedItemChange = new EventEmitter();

  public gendersLookup$: Observable<ActiveLookup[]>;

  constructor(private readonly lookupsService: LookupsService) {
    this.gendersLookup$ = this.lookupsService.gendersLookup$;
  }
}
