import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AgentKeys, BaseModelKeys, Social, Website, WebsiteKeys } from 'ag-common-lib/public-api';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { Observable } from 'rxjs';
import { AgentEditorService } from '../../agent-editor.service';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { BUSINESS_PERSONAL_TYPE_LOOKUP } from 'ag-common-lib/lib/lists/business-personal-type.list';

@Component({
  selector: 'ag-shr-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.scss'],
  providers: [AgentEditorService]
})
export class WebsitesComponent implements OnInit {
  @Input() agentId: string;
  @Input() websites: Website[] = [];
  @Output() websitesChange = new EventEmitter<Social[]>();

  @ViewChild('websitesEditorModalRef', { static: true }) websitesEditorModalRef: ModalWindowComponent;

  public inProgress = false;
  public inProgress$: Observable<boolean>;

  protected readonly BaseModelKeys = BaseModelKeys;
  protected readonly WebsiteKeys = WebsiteKeys;
  protected readonly BUSINESS_PERSONAL_TYPE_LOOKUP = BUSINESS_PERSONAL_TYPE_LOOKUP;

  constructor(private toastrService: ToastrService,
              private agentService: AgentService) {}

  ngOnInit(): void {
  }

  public showWebsitesEditorModal = () => {
    this.websitesEditorModalRef.showModal();
  };

  public validateUrlWithOrWithoutProtocol = (e) => {
    const re = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return re.test(e.value);
  }

  public onRowInserting = (e) => {
    const { __KEY__: key, ...data } = e?.data;
    //
    const isUniq = this.checkIsWebsiteUniq(data);

    if (!isUniq) {
      this.toastrService.error('Same Social already exists in this profile');

      e.cancel = true;
      return;
    }

    const websites = this.normalizeWebsites(data);

    websites.push(Object.assign({ id: key }, data));

    e.cancel = this.updateWebsites(websites);
  };

  public onRowUpdating = (e) => {
    const data = Object.assign({}, e?.oldData, e?.newData);

    const isUniq = this.checkIsWebsiteUniq(data, e?.key);

    if (!isUniq) {
      this.toastrService.error('Same Social already exists in this profile');

      e.cancel = true;
      return;
    }

    const Websites = this.normalizeWebsites(data, e?.key);

    e.cancel = this.updateWebsites(Websites);
  };

  public onRowRemoving = (e) => {
    const Websites = this.websites.filter((address) => {
      return address !== e.key;
    });

    e.cancel = this.updateWebsites(Websites);
  };

  private checkIsWebsiteUniq = (data, key?: Website) => {
    return this.websites.every((website) => {
      if (key && website === key) {
        return true;
      }

      return data?.url !== website?.url;
    });
  };

  private normalizeWebsites = (data, key?: Website) => {
    return this.websites.map((website) => {
      if (key && website === key) {
        return data;
      }

      return Object.assign({}, website);
    });
  };


  private updateWebsites = (websites: Website[]) => {
    return this.agentService
      .updateFields(this.agentId, { [AgentKeys.websites]: websites })
      .then(() => {
        this.websites = websites;
        this.websitesChange.emit(websites);
      })
      .finally(() => {
        this.inProgress = false;
      });
  };
}
