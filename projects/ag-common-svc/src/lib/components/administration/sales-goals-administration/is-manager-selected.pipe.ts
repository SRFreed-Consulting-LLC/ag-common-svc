import { Pipe, PipeTransform } from '@angular/core';
import { AgentKeys } from 'ag-common-lib/lib/models/domain/agent.model';
import { DxDataGridComponent } from 'devextreme-angular';

@Pipe({
  name: 'isManagersSelected'
})
export class IsManagerSelectedPipe implements PipeTransform {

  transform(selectedRowData: DxDataGridComponent): boolean {
    return selectedRowData.instance.getSelectedRowsData().map(data => data[AgentKeys.is_manager]).includes(Boolean);
  }

}
