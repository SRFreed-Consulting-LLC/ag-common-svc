import { NeedToKnow } from 'ag-common-lib/public-api';

export interface NeedToKnowConfig {
  title?: string;
  isVisibilityTypeLocked?: boolean;
  initialNeedToKnow?: Partial<NeedToKnow>;
}
