import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Agent, AgentKeys, AgentReviewLevel, AGENT_STATUS, BaseModelKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { FormChangesDetector } from '../../../../../shared/utils';
import { pick } from 'lodash';
import { AgentService } from '../../../../services/agent.service';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

@Injectable()
export class PortalService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public isReviewLevelVisible$ = new BehaviorSubject(false);

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  private agentId: string;

  constructor(private agentService: AgentService) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public save = async (modalWindowComponent: ModalWindowComponent) => {
    const hasChanges = this.formChangesDetector.hasChanges;

    if (hasChanges) {
      this._inProgress$.next(true);

      const agentId = this.agentId;
      const updates = {};
      const changes = this.formChangesDetector.getAllChanges();

      changes.forEach(([key]) => {
        Object.assign(updates, { [key]: this.formData[key] });
      });
      await this.agentService
        .updateFields(agentId, updates)
        .then(() => {
          this.formChangesDetector.clear();
          modalWindowComponent?.hideModal();
        })
        .finally(() => {
          this._inProgress$.next(false);
        });

      return { agentId, updates };
    }

    if (!hasChanges) {
      modalWindowComponent?.hideModal();
    }

    return null;
  };

  public onCancel = ({ event, component }) => {
    if (!this.formChangesDetector?.hasChanges) {
      return;
    }

    event.cancel = true;

    const result = confirm('<i>Are you sure you want to Cancel without Saving?</i>', 'Confirm');
    result.then((dialogResult) => {
      if (dialogResult) {
        const changes = this.formChangesDetector.getAllChanges();

        changes.forEach(([key, value]) => {
          Object.assign(this.formData, { [key]: value });
        });

        this.formChangesDetector?.clear();
        component.instance.hide();
      }
    });
  };

  public getFormData = (agent?: Partial<Agent>) => {
    this.agentId = agent[BaseModelKeys.dbId];
    const initialData = pick(agent, [
      AgentKeys.p_agent_id,
      AgentKeys.p_registered_user,
      AgentKeys.agent_status,
      AgentKeys.agent_review_level,
      AgentKeys.p_strategic_agent,
      AgentKeys.prospect_status,
      AgentKeys.alliance_group_employee,
      AgentKeys.role,
      AgentKeys.agent_type,
      AgentKeys.is_rmd,
      AgentKeys.christmas_card
    ]);

    const isReviewLevelVisible = agent[AgentKeys.agent_status] === AGENT_STATUS.IN_REVIEW;
    this.isReviewLevelVisible$.next(isReviewLevelVisible);

    this.formData = new Proxy(initialData, {
      set: (target, prop, value, receiver) => {
        const prevValue = target[prop];
        this.formChangesDetector.handleChange(prop, value, prevValue);
        Reflect.set(target, prop, value, receiver);
        switch (prop) {
          case AgentKeys.agent_status:
            if (value !== AGENT_STATUS.IN_REVIEW) {
              Reflect.set(target, AgentKeys.agent_review_level, null, receiver);
            }
            if (value === AGENT_STATUS.IN_REVIEW) {
              Reflect.set(target, AgentKeys.agent_review_level, AgentReviewLevel.AllianceGroupLevel, receiver);
            }
            this.isReviewLevelVisible$.next(value === AGENT_STATUS.IN_REVIEW);
            break;

          default:
            break;
        }
        return true;
      }
    });

    return this.formData;
  };
}
