import { Injectable } from '@angular/core';
import { ActiveLookup, Lookups, LookupKeys, Lookup, BaseModelKeys } from 'ag-common-lib/public-api';
import { Observable, of } from 'rxjs';
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
  public readonly emailTypeLookup$: Observable<ActiveLookup[]>;

  constructor(private lookupsManagerService: LookupsManagerService) {
    this.gendersLookup$ = this.lookupsManagerService
      .getList(Lookups.Genders)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.suffixesLookup$ = this.lookupsManagerService.getList(Lookups.Suffixes).pipe(
      map(this.normalizeLookup),
      map((items) => items.sort(this.suffixComparator)),
      shareReplay(1)
    );
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
    this.emailTypeLookup$ = this.lookupsManagerService
      .getList(Lookups.EmailTypes)
      .pipe(map(this.normalizeLookup), shareReplay(1));
    this.tShortSizesLookup$ = this.lookupsManagerService.getList(Lookups.TShirtSize).pipe(
      map(this.normalizeLookup),
      map((items) => items.sort(this.sizeComparator)),
      shareReplay(1)
    );
  }

  public getLookupByName = (lookup: Lookups) => {
    switch (lookup) {
      case Lookups.States:
        return this.statesLookup$;
      case Lookups.EmailTypes:
        return this.emailTypeLookup$;
      case Lookups.Genders:
        return this.gendersLookup$;
      case Lookups.Suffixes:
        return this.suffixesLookup$;
      case Lookups.Prefixes:
        return this.prefixesLookup$;
      case Lookups.TaskCategory:
        return this.taskCategoryLookup$;
      case Lookups.TaskSubcategory:
        return this.taskSubcategoryLookup$;
      case Lookups.AssociationType:
        return this.associationTypeLookup$;
      case Lookups.TShirtSize:
        return this.tShortSizesLookup$;
      case Lookups.DietaryConsiderationType:
        return this.dietaryConsiderationTypesLookup$;
      default:
        return of([]);
    }
  };

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
            [LookupKeys.isDefault]: isDefault,
            [LookupKeys.isAssigned]: isAssigned
          } = lookup;

          return {
            [BaseModelKeys.dbId]: dbId,
            [LookupKeys.value]: value,
            [LookupKeys.reference]: reference,
            [LookupKeys.description]: description,
            [LookupKeys.isAssigned]: isAssigned,
            [LookupKeys.isDefault]: isDefault,
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

  private suffixComparator = (left, right) => {
    const valuesMap = new Map([
      ['jr', '0'],
      ['sr', '1'],
      ['ii', '2'],
      ['iii', '3'],
      ['iiii', '4'],
      ['iv', '5']
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
