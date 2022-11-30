import { ApproveDenyReason } from 'ag-common-lib/public-api';

export interface ApproveDenyReasonEditorConfig {
  title?: string;
  isVisibilityTypeLocked?: boolean;
  initialApproveDenyReason?: Partial<ApproveDenyReason>;
}
