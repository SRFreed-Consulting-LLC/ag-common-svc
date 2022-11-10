import { Pipe, PipeTransform } from '@angular/core';
import { Lookup, LookupKeys, TaskWorkflow, TaskWorkflowKeys } from 'ag-common-lib/public-api';

@Pipe({ name: 'taskWorkflowDetails' })
export class TaskWorkflowDetailsPipe implements PipeTransform {
  transform(taskWorkflow: TaskWorkflow): Promise<string> {
    const promises = [taskWorkflow[TaskWorkflowKeys.categoryRef], taskWorkflow[TaskWorkflowKeys.subcategoryRef]]
      .filter(Boolean)
      .map((item: any) => item?.get());

    return Promise.all(promises).then((items) => {
      const lookupsData = items.map((item) => item.data());

      return `(${lookupsData
        .map((lookup: Lookup) => lookup[LookupKeys.description])
        .filter(Boolean)
        .join(', ')})`;
    });
  }
}
