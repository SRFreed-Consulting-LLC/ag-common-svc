import { Component, Input, ViewChild } from '@angular/core';
import { Agent, BaseModelKeys, Lookup } from 'ag-common-lib/public-api';
import { DxFormComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModalWindowComponent } from '../../../modal-window/modal-window.component';
import { DietaryConsiderationService } from './dietary-considerations.service';

@Component({
  selector: 'ag-shr-dietary-considerations',
  templateUrl: './dietary-considerations.component.html',
  styleUrls: ['./dietary-considerations.component.scss'],
  providers: [DietaryConsiderationService]
})
export class DietaryConsiderationsComponent {
  @Input('agent') set _agent(value: Agent) {
    this.agent = value;
    this.dietaryConsiderationFormDetails = this.dietaryConsiderationService.getFormData(value);
  }
  @ViewChild('dietaryConsiderationModalRef', { static: true }) dietaryConsiderationModalComponent: ModalWindowComponent;
  @ViewChild('dietaryConsiderationFormRef', { static: false }) dietaryConsiderationFormComponent: DxFormComponent;

  public dietaryConsiderationFormDetails;
  public inProgress$: Observable<boolean>;
  public validationGroup = 'dietaryConsiderationValidationGroup';
  public selectedDietaryConsiderationType$: BehaviorSubject<Lookup>;

  private agent: Agent;

  constructor(private dietaryConsiderationService: DietaryConsiderationService) {
    this.inProgress$ = dietaryConsiderationService.inProgress$;
    this.selectedDietaryConsiderationType$ = dietaryConsiderationService.selectedDietaryConsiderationType$;
  }

  public saveAgentUpdates = () => {
    const validationResults = this.dietaryConsiderationFormComponent.instance.validate();
    if (validationResults.isValid) {
      this.dietaryConsiderationService.handleSave(
        this.agent[BaseModelKeys.dbId],
        this.dietaryConsiderationModalComponent
      );
    }
  };

  public showEditorModal = () => {
    this.dietaryConsiderationModalComponent.showModal();
  };

  public handleClosePopup = (e) => {
    this.dietaryConsiderationService.onCancelEdit(e);
  };

  public handleDietaryConsiderationTypeSelect = (item) => {
    this.selectedDietaryConsiderationType$.next(item);
  };
}
