import { Injectable } from '@angular/core';
import { ActiveLookup, Lookups, LookupKeys, Lookup, BaseModelKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { QueryParam, WhereFilterOperandKeys } from '../../public-api';
import { LookupsManagerService } from './lookups-manager.service';

@Injectable({ providedIn: 'root' })
export class LookupsService {
  public readonly statesLookup$: Observable<ActiveLookup[]>;
  public readonly gendersLookup$: Observable<ActiveLookup[]>;
  public readonly dietaryConsiderationTypesLookup$: Observable<ActiveLookup[]>;
  public readonly tShortSizesLookup$: Observable<ActiveLookup[]>;
  public readonly suffixesLookup$: Observable<ActiveLookup[]>;
  public readonly prefixesLookup$: Observable<ActiveLookup[]>;
  public readonly taskCategoryLookup$: Observable<ActiveLookup[]>;
  public readonly taskSubcategoryLookup$: Observable<ActiveLookup[]>;
  public readonly associationTypeLookup$: Observable<ActiveLookup[]>;

  constructor(private lookupsManagerService: LookupsManagerService) {
    this.gendersLookup$ = this.lookupsManagerService
      .getList(Lookups.Genders)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.suffixesLookup$ = this.lookupsManagerService
      .getList(Lookups.Suffixes)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.prefixesLookup$ = this.lookupsManagerService
      .getList(Lookups.Prefixes)
      .pipe(map(this.normalizeLookup), shareReplay(1));
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
    this.dietaryConsiderationTypesLookup$ = this.lookupsManagerService
      .getList(Lookups.DietaryConsiderationType)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.tShortSizesLookup$ = this.lookupsManagerService.getList(Lookups.TShirtSize).pipe(
      map(this.normalizeLookup),
      map((items) => items.sort(this.sizeComparator)),
      shareReplay(1)
    );
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

  private sizeComparator = (left, right) => {
    const valuesMap = new Map([
      ['xs', '0'],
      ['s', '1'],
      ['m', '2'],
      ['l', '3'],
      ['xl', '4'],
      ['xxl', '5'],
      ['xxxl', '6'],
      ['other', '7']
    ]);
    const leftValue = valuesMap.get(`${left?.value}`.toLocaleLowerCase()) ?? `${left?.value}`;
    const rightValue = valuesMap.get(`${right?.value}`.toLocaleLowerCase()) ?? `${right?.value}`;

    return leftValue.localeCompare(rightValue, 'en', {
      numeric: true,
      sensitivity: 'base',
      ignorePunctuation: true
    });
  };
}
