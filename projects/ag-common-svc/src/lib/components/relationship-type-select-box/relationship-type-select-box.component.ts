import { EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Component } from '@angular/core';
import { ActiveLookup, BaseModelKeys, LookupKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { LookupsService } from '../../services';

@Component({
  selector: 'ag-shr-relationship-type-select-box',
  templateUrl: './relationship-type-select-box.component.html',
  styleUrls: ['./relationship-type-select-box.component.scss']
})
export class RelationshipTypeSelectBoxComponent {
  @HostBinding('class') className = 'relationship-type-select-box';
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = 'Relationship Type';
  @Input() placeholder: string = '';
  @Input() labelMode: 'static' | 'floating' | 'hidden' = 'floating';
  @Input() value: any;
  @Output() valueChange = new EventEmitter();
  @Output() selectedItemChange = new EventEmitter();

  public LookupKeys = LookupKeys;
  public BaseModelKeys = BaseModelKeys;
  public associationTypeLookup$: Observable<ActiveLookup[]>;

  constructor(private readonly lookupsService: LookupsService) {
    this.associationTypeLookup$ = this.lookupsService.associationTypeLookup$;
  }
}
