import { Pipe, PipeTransform } from '@angular/core';
import { AgentReviewLevel, AgentReviewLevelDescriptionMap } from 'ag-common-lib/public-api';

@Pipe({ name: 'reviewLevel' })
export class ReviewLevelPipe implements PipeTransform {
  transform(item: AgentReviewLevel): string {
    if (!item || !AgentReviewLevelDescriptionMap.has(item)) {
      return '';
    }
    return AgentReviewLevelDescriptionMap.get(item);
  }
}
