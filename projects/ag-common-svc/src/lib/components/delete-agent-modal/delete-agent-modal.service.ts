import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { LoggerService } from '../../services/logger.service';
import { DeleteAgentModalFormData } from './delete-agent-modal.model';

@Injectable()
export class DeleteAgentModalService {
  public inProgress$: Observable<boolean>;
  private readonly _inProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    private cloudFunctionsService: CloudFunctionsService,
    public toster: ToastrService,
    public loggerService: LoggerService,
  ) {
    this.inProgress$ = this._inProgress$.asObservable();
  }

  public save = (agent, formData: DeleteAgentModalFormData) => {
    const promisees = [];

    if (formData?.deleteAuthLogin) {
      promisees.push(this.deleteAuthLogin(agent));
    }

    if (formData?.deleteAgentRecord) {
      promisees.push(this.deleteAgentAccount(agent));
    }

    this._inProgress$.next(true);
    return Promise.all(promisees).finally(() => {
      this._inProgress$.next(false);
    });
  };

  private async deleteAgentAccount(agent) {
    await this.cloudFunctionsService
      .deleteAgent(agent?.dbId)
      .then(() => {
        this.toster.success('Agent Record Deleted!');
      })
      .catch((e) => {
        debugger;
        // TODO handel errors
      });
  }

  private async deleteAuthLogin(agent) {
    await this.cloudFunctionsService
      .deleteFirebaseUser(agent?.uid)
      .then(() => {
        this.toster.success('Agent Auth Record Deleted!');
      })
      .catch((e) => {
        debugger;
        // TODO handel errors
      });
  }
}
