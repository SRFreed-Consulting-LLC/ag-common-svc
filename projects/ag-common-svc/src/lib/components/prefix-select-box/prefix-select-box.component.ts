import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { LookupsService } from '../../services';

@Component({
  selector: 'ag-shr-prefix-select-box',
  templateUrl: './prefix-select-box.component.html',
  styleUrls: ['./prefix-select-box.component.scss']
})
export class PrefixSelectBoxComponent {
  @HostBinding('class') className = 'prefix-select-box';
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = 'Prefix';
  @Input() labelMode: 'static' | 'floating' | 'hidden' = 'floating';
  @Input() value: any;
  @Output() valueChange = new EventEmitter();

  public prefixesLookup$: Observable<ActiveLookup[]>;

  constructor(private readonly lookupsService: LookupsService) {
    this.prefixesLookup$ = this.lookupsService.prefixesLookup$;
  }
}
