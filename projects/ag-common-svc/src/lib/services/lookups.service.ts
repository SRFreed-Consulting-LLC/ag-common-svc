import { Injectable } from '@angular/core';
import { ActiveLookup, Lookups, LookupKeys, Lookup, BaseModelKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';
import { LookupsManagerService } from './lookups-manager.service';

@Injectable({ providedIn: 'root' })
export class LookupsService {
  public readonly statesLookup$: Observable<ActiveLookup[]>;
  public readonly taskCategoryLookup$: Observable<ActiveLookup[]>;
  public readonly taskSubcategoryLookup$: Observable<ActiveLookup[]>;
  public readonly associationTypeLookup$: Observable<ActiveLookup[]>;

  constructor(private lookupsManagerService: LookupsManagerService) {
    this.statesLookup$ = this.lookupsManagerService
      .getList(Lookups.States)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.taskCategoryLookup$ = this.lookupsManagerService
      .getList(Lookups.TaskCategory)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.taskSubcategoryLookup$ = this.lookupsManagerService
      .getList(Lookups.TaskSubcategory)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.associationTypeLookup$ = this.lookupsManagerService
      .getList(Lookups.AssociationType)
      .pipe(map(this.normalizeLookup), shareReplay(1));
  }

  public getTaskSubcategoryLookup = (taskCategoryDbId) => {
    if (!taskCategoryDbId) {
      return undefined;
    }
    return this.lookupsManagerService
      .getList(Lookups.TaskSubcategory, [
        new QueryParam(LookupKeys.dependsOn, WhereFilterOperandKeys.equal, taskCategoryDbId)
      ])
      .pipe(map(this.normalizeLookup), shareReplay(1));
  };

  private normalizeLookup = (items: Lookup[]) => {
    return Array.isArray(items)
      ? items.map((lookup) => {
          const {
            [BaseModelKeys.dbId]: dbId,
            [BaseModelKeys.firebaseRef]: reference,
            [LookupKeys.value]: value,
            [LookupKeys.description]: description,
            [LookupKeys.isActive]: isActive,
            [LookupKeys.isAssigned]: isAssigned
          } = lookup;

          return {
            [BaseModelKeys.dbId]: dbId,
            [LookupKeys.value]: value,
            [LookupKeys.reference]: reference,
            [LookupKeys.description]: description,
            [LookupKeys.isAssigned]: isAssigned,
            [LookupKeys.visible]: isActive
          };
        })
      : [];
  };
}
