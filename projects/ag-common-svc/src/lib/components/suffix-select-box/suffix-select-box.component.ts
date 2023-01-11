import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { ActiveLookup } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { LookupsService } from '../../services';

@Component({
  selector: 'ag-shr-suffix-select-box',
  templateUrl: './suffix-select-box.component.html',
  styleUrls: ['./suffix-select-box.component.scss']
})
export class SuffixSelectBoxComponent {
  @HostBinding('class') className = 'suffix-select-box';
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = 'Suffix';
  @Input() labelMode: 'static' | 'floating' | 'hidden' = 'floating';
  @Input() value: any;
  @Output() valueChange = new EventEmitter();

  public suffixesLookup$: Observable<ActiveLookup[]>;

  constructor(private readonly lookupsService: LookupsService) {
    this.suffixesLookup$ = this.lookupsService.suffixesLookup$;
  }
}
