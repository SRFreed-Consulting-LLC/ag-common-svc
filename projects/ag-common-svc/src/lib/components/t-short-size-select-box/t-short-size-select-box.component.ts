import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { ActiveLookup, BaseModelKeys, LookupKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { LookupsService } from '../../services';

@Component({
  selector: 'ag-shr-t-short-size-select-box',
  templateUrl: './t-short-size-select-box.component.html',
  styleUrls: ['./t-short-size-select-box.component.scss']
})
export class TShortSizeSelectBoxComponent {
  @HostBinding('class') className = 't-short-size-select-box';
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = 'T-Short Size';
  @Input() placeholder: string = '';
  @Input() labelMode: 'static' | 'floating' | 'hidden' = 'floating';
  @Input() value: any;
  @Output() valueChange = new EventEmitter();
  @Output() selectedItemChange = new EventEmitter();

  public LookupKeys = LookupKeys;
  public BaseModelKeys = BaseModelKeys;
  public tShortSizesLookup$: Observable<ActiveLookup[]>;

  constructor(private readonly lookupsService: LookupsService) {
    this.tShortSizesLookup$ = this.lookupsService.tShortSizesLookup$;
  }
}
