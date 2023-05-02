import { Agent, AgentKeys } from 'ag-common-lib/lib/models/domain/agent.model';
import { Goal } from 'ag-common-lib/lib/models/utils/goal.model';

export enum GOALS_TYPES {
  PERSONAL,
  CONFERENCE,
  MANAGER
}

export const modalLabelMap: Map<GOALS_TYPES, string> = new Map<GOALS_TYPES, string>([
  [GOALS_TYPES.PERSONAL, 'Personal'],
  [GOALS_TYPES.CONFERENCE, 'Conference'],
  [GOALS_TYPES.MANAGER, 'Manager']
]);

export const goalTypeToAgentKeyMap: Map<GOALS_TYPES, AgentKeys> = new Map<GOALS_TYPES, AgentKeys>([
  [GOALS_TYPES.PERSONAL, AgentKeys.personal_goals],
  [GOALS_TYPES.CONFERENCE, AgentKeys.conference_goals],
  [GOALS_TYPES.MANAGER, AgentKeys.manager_goals]
]);

export const GOALS_TYPES_LOOKUP = [
  { value: GOALS_TYPES.PERSONAL, description: modalLabelMap.get(GOALS_TYPES.PERSONAL) },
  { value: GOALS_TYPES.CONFERENCE, description: modalLabelMap.get(GOALS_TYPES.CONFERENCE) },
  { value: GOALS_TYPES.MANAGER, description: modalLabelMap.get(GOALS_TYPES.MANAGER) },
];

export interface SalesGoals {
  selectedAgents: Partial<Agent>[];
  year: number;
  salesGoal: number;
  goalsType: GOALS_TYPES
}

export interface SalesGoalAgentData {
  key: string,
  description: string,
  [AgentKeys.personal_goals]: Goal[],
  [AgentKeys.conference_goals]: Goal[],
  [AgentKeys.manager_goals]: Goal[],
  currentPersonalGoals: number;
  currentConferenceGoals: number;
  currentManagerGoals: number;
  [AgentKeys.is_manager]: boolean
}

const agentGoalsProperties = [AgentKeys.personal_goals, AgentKeys.conference_goals, AgentKeys.manager_goals] as const;
export type AgentGoalsFields = typeof agentGoalsProperties[number];
