import { Pipe, PipeTransform } from '@angular/core';
import { AgentKeys } from 'ag-common-lib/public-api';

@Pipe({ name: 'fullName', pure: false })
export class FullNamePipe implements PipeTransform {
  transform(item: any, fullNameExp?: (item: any) => string): string {
    if (fullNameExp) {
      return fullNameExp(item);
    }
    return item
      ? [item[AgentKeys.p_agent_first_name], item[AgentKeys.p_agent_last_name], item[AgentKeys.p_suffix]]
          .filter(Boolean)
          .join(' ')
      : '';
  }
}
