import { Pipe, PipeTransform } from '@angular/core';
import { Agency } from 'ag-common-lib/public-api';
import { AgentService } from 'ag-common-svc/public-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'agentNameByDbId' })
export class AgentNameByDbIdePipe implements PipeTransform {
  constructor(private agentService: AgentService) {}

  transform(agentDbId: string, converter?: (agency: Agency) => string): Observable<string> {
    return this.agentService.getDocument(agentDbId).pipe(
      map((agentSnapshot) => {
        if (agentSnapshot.exists()) {
          const data = agentSnapshot.data();
          return [data?.p_agent_first_name, data?.p_agent_last_name].filter(Boolean).join(' ');
        }
        return '';
      }),
    );
  }
}
