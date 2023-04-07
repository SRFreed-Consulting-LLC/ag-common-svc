import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AgentKeys, BaseModelKeys, LookupKeys, Social, SocialKeys } from 'ag-common-lib/public-api';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../../services/agent.service';
import { AgentEditorService } from '../../agent-editor.service';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';

@Component({
  selector: 'ag-shr-socials',
  templateUrl: './socials.component.html',
  styleUrls: ['./socials.component.scss'],
  providers: [AgentEditorService]
})
export class SocialsComponent implements OnInit {
  @Input() agentId: string;
  @Input() socials: Social[] = [];
  @Output() socialsChange = new EventEmitter<Social[]>();

  @ViewChild('socialsEditorModalRef', { static: true }) socialsEditorModalRef: ModalWindowComponent;

  public inProgress = false;
  public inProgress$: Observable<boolean>;

  protected readonly SocialKeys = SocialKeys;
  protected readonly LookupKeys = LookupKeys;
  protected readonly BaseModelKeys = BaseModelKeys;

  constructor(private agentService: AgentService,
              private toastrService: ToastrService,
              public agentEditorService: AgentEditorService) {}

  ngOnInit(): void {
  }

  public showSocialsEditorModal = () => {
    this.socialsEditorModalRef.showModal();
  };

  public onRowInserting = (e) => {
    const { __KEY__: key, ...data } = e?.data;
    //
    const isUniq = this.checkIsSocialUniq(data);

    if (!isUniq) {
      this.toastrService.error('Same Social already exists in this profile');

      e.cancel = true;
      return;
    }

    const socials = this.normalizeSocials(data);

    socials.push(Object.assign({ id: key }, data));

    e.cancel = this.updateSocials(socials);
  };

  public onRowUpdating = (e) => {
    const data = Object.assign({}, e?.oldData, e?.newData);

    const isUniq = this.checkIsSocialUniq(data, e?.key);

    if (!isUniq) {
      this.toastrService.error('Same Social already exists in this profile');

      e.cancel = true;
      return;
    }

    const Socials = this.normalizeSocials(data, e?.key);

    e.cancel = this.updateSocials(Socials);
  };

  public onRowRemoving = (e) => {
    const Socials = this.socials.filter((address) => {
      return address !== e.key;
    });

    e.cancel = this.updateSocials(Socials);
  };

  private checkIsSocialUniq = (data, key?: Social) => {
    return this.socials.every((social) => {
      if (key && social === key) {
        return true;
      }

      return data?.url !== social?.url;
    });
  };

  private normalizeSocials = (data, key?: Social) => {
    return this.socials.map((social) => {
      if (key && social === key) {
        return data;
      }

      return Object.assign({}, social);
    });
  };


  private updateSocials = (socials: Social[]) => {
    return this.agentService
      .updateFields(this.agentId, { [AgentKeys.socials]: socials })
      .then(() => {
        this.socials = socials;
        this.socialsChange.emit(socials);
      })
      .finally(() => {
        this.inProgress = false;
      });
  };
}
