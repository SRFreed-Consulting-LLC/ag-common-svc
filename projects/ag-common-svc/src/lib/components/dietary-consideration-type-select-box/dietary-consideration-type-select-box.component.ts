import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { ActiveLookup, BaseModelKeys, LookupKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { LookupsService } from '../../services';

@Component({
  selector: 'ag-shr-dietary-consideration-type-select-box',
  templateUrl: './dietary-consideration-type-select-box.component.html',
  styleUrls: ['./dietary-consideration-type-select-box.component.scss']
})
export class DietaryConsiderationTypeSelectBoxComponent {
  @HostBinding('class') className = 'dietary-consideration-type-select-box';
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() validationGroup: string;
  @Input() isRequired: boolean = false;
  @Input() label: string = 'Consideration Type';
  @Input() placeholder: string = '';
  @Input() labelMode: 'static' | 'floating' | 'hidden' = 'floating';
  @Input() value: any;
  @Output() valueChange = new EventEmitter();
  @Output() selectedItemChange = new EventEmitter();

  public LookupKeys = LookupKeys;
  public BaseModelKeys = BaseModelKeys;
  public dietaryConsiderationTypesLookup$: Observable<ActiveLookup[]>;

  constructor(private readonly lookupsService: LookupsService) {
    this.dietaryConsiderationTypesLookup$ = this.lookupsService.dietaryConsiderationTypesLookup$;
  }
}
