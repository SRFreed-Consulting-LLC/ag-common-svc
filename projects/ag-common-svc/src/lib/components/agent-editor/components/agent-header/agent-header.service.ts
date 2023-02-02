import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Agent, AgentKeys, BaseModelKeys, LookupKeys } from 'ag-common-lib/public-api';
import { map } from 'rxjs/operators';
import { FormChangesDetector } from '../../../../../shared/utils';
import { confirm } from 'devextreme/ui/dialog';
import { AgentService } from '../../../../services/agent.service';
import { updateDoc } from 'firebase/firestore';
import { pick } from 'lodash';
import { FireStorageDao } from '../../../../dao/FireStorage.dao';

@Injectable()
export class AgentHeaderService {
  public formData: Partial<Agent>;
  public hasFormChanges$: Observable<boolean>;
  public readonly formChangesDetector: FormChangesDetector = new FormChangesDetector();

  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly agentService: AgentService, private fireStorageDao: FireStorageDao) {
    this.inProgress$ = this._inProgress$.asObservable();
    this.hasFormChanges$ = this.formChangesDetector.actions$.pipe(
      map(() => {
        return this.formChangesDetector.hasChanges;
      })
    );
  }

  public handleSave = async (agentId) => {
    const updates = {};
    const changes = this.formChangesDetector.getAllChanges();

    changes.forEach(([key]) => {
      Object.assign(updates, { [key]: this.formData[key] ?? null });
    });

    this._inProgress$.next(true);

    const profilePictureUrl: string = updates[AgentKeys.p_headshot_link];
    if (profilePictureUrl && profilePictureUrl.startsWith('data:image/png;base64')) {
      const filename = [
        this.formData[AgentKeys.p_agent_first_name],
        this.formData[AgentKeys.p_agent_middle_name],
        this.formData[AgentKeys.p_agent_last_name]
      ]
        .filter(Boolean)
        .join('_')
        .replace(/\s/g, '');

      const file = await fetch(profilePictureUrl)
        .then((res) => res.blob())
        .then((blob) => {
          return new File([blob], `${filename}.png`, { type: blob.type });
        });

      const firestoreFile = await this.fireStorageDao.uploadFile(file, '/head_shot/' + filename);

      const url = await this.fireStorageDao.getFileURL(firestoreFile.ref);

      updates[AgentKeys.p_headshot_link] = url;
      this.formData[AgentKeys.p_headshot_link] = url;
    }

    await this.agentService
      .updateFields(agentId, updates)
      .then(() => {
        this.formChangesDetector.clear();

        return updates;
      })

      .finally(() => {
        this._inProgress$.next(false);
      });

    return { agentId, updates };
  };

  public onCancelEdit = ({ event, component }) => {
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
    const initialData = pick(agent, [
      AgentKeys.p_prefix,
      AgentKeys.p_agent_first_name,
      AgentKeys.p_agent_middle_name,
      AgentKeys.p_agent_last_name,
      AgentKeys.p_suffix,
      AgentKeys.p_headshot_link,
      AgentKeys.title,
      AgentKeys.p_mga_id,
      AgentKeys.p_agency_id,
      AgentKeys.addresses,
      AgentKeys.email_addresses,
      AgentKeys.phone_numbers
    ]);
    console.log('initialData', initialData);
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
