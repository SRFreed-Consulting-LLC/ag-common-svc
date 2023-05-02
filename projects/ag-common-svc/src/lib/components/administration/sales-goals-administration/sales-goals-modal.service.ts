import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { goalTypeToAgentKeyMap, SalesGoalAgentData, SalesGoals } from './sales-goals.model';
import { AgentKeys } from 'ag-common-lib/lib/models/domain/agent.model';
import { isArray } from 'lodash';
import {
  UpdateAgentGoalsPayload,
  UpdateAgentsGoalsKeys,
  UpdateAgentsGoalsModel,
} from 'ag-common-lib/lib/models/functions/update-agents-goals.model';
import { CloudFunctionsService } from '../../../services/cloud-functions.service';
import { FormChangesDetector } from '../../../../shared/utils';
import { Goal } from 'ag-common-lib/lib/models/utils/goal.model';

@Injectable()
export class SalesGoalsModalService {
  public formData: Partial<SalesGoals>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    private cloudFuntionService: CloudFunctionsService
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public handleSave = () => {
    const updatedAgents: UpdateAgentGoalsPayload[] = this.formData.selectedAgents.map((agent: SalesGoalAgentData) => {
      const newGoalPerYear: Goal = {year: this.formData.year, amount: this.formData.salesGoal };
      const goalAgentKey = goalTypeToAgentKeyMap.get(this.formData.goalsType)
      const remainingGoals = isArray(agent[goalAgentKey]) ? agent[goalAgentKey]?.filter(goal => goal.year !== this.formData.year) ?? [] : [];

      remainingGoals.push(newGoalPerYear);
      agent[goalAgentKey] = remainingGoals;

      return {
        [UpdateAgentsGoalsKeys.agentDbId]: agent.key,
        [UpdateAgentsGoalsKeys.updateData]: {
          [AgentKeys.personal_goals]: agent[AgentKeys.personal_goals],
          [AgentKeys.conference_goals]: agent[AgentKeys.conference_goals],
          [AgentKeys.manager_goals]: agent[AgentKeys.manager_goals]
        } as UpdateAgentsGoalsModel
      } as UpdateAgentGoalsPayload;
    })

    this._inProgress$.next(true);
    return this.cloudFuntionService
      .updateSalesGoals(updatedAgents)
      .then(() => {
        this.formChangesDetector.clear();
      })
      .finally(() => {
        this._inProgress$.next(false);
      });
  };



  public onCancelEdit = ({ event, component }) => {
    if (!this.formChangesDetector?.hasChanges) {
      return;
    }

    event.cancel = true;

    const result = confirm('<i>Are you sure you want to Cancel without Saving?</i>', 'Confirm');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.formChangesDetector?.clear();
        component.instance.hide();
      }
    });
  };

  public getFormData = (salesGoals?: Partial<SalesGoals>) => {
    const initialData = Object.assign({}, salesGoals);

    this.formData = new Proxy(initialData, {
      set: (target, prop, value, receiver) => {
        const prevValue = target[prop];
        this.formChangesDetector.handleChange(prop, value, prevValue);
        Reflect.set(target, prop, value, receiver);

        return true;
      }
    });

    return this.formData;
  };
}
