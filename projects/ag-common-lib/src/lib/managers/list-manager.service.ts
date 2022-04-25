import { Injectable } from "@angular/core";
import { AGENT_STATUS } from "../lists/agent-status.enum";
import { AGENT_TYPE } from "../lists/agent-type.enum";
import { APP_EVENTS } from "../lists/application-events.enum";
import { APP_ENTITIES } from "../lists/application_entities.enum";
import { ASSOCIATION_TYPE } from "../lists/association-type.enum";
import { PROSPECT_PRIORITY } from "../lists/prospect-priority.enum";
import { PROSPECT_STATUS } from "../lists/prospect-status.enum";
import { Role } from "../lists/roles.enum";
import { TASK_PRIORITY } from "../lists/task-priority.enum";
import { TASK_STATUS } from "../lists/task-status.enum";

@Injectable({
    providedIn: 'root'
})

export class ListManager{
    public getAgentTypes(): AGENT_TYPE[]{
        let retval: AGENT_TYPE[] = [];

        retval.push(AGENT_TYPE.MGA_PRINCIPAL);
        retval.push(AGENT_TYPE.MGA_ADMIN);
        retval.push(AGENT_TYPE.AGENCY_PRINCIPAL);
        retval.push(AGENT_TYPE.AGENCY_ADMIN);
        retval.push(AGENT_TYPE.GENERAL_AGENT);

        return retval;
    }

    public getProspectStatuses(): PROSPECT_STATUS[]{
        let retval: PROSPECT_STATUS[] = [];

        retval.push(PROSPECT_STATUS.INVESTIGATION);
        retval.push(PROSPECT_STATUS.COMPLETE);
        retval.push(PROSPECT_STATUS.FOLLOW_UP);
        retval.push(PROSPECT_STATUS.INITIAL_INQUIRY);
        retval.push(PROSPECT_STATUS.NEW_PROSPECT);
        retval.push(PROSPECT_STATUS.ROUTING);

        return retval;
    }

    public getAgentStatuses(): AGENT_STATUS[]{
        let retval: AGENT_STATUS[] = [];

        retval.push(AGENT_STATUS.APPROVED);
        retval.push(AGENT_STATUS.CARRIER_REP);
        retval.push(AGENT_STATUS.CLOSED_PROSPECT);
        retval.push(AGENT_STATUS.DENIED);
        retval.push(AGENT_STATUS.IN_REVIEW);
        retval.push(AGENT_STATUS.INACTIVE);
        retval.push(AGENT_STATUS.NEW_AGENT);
        retval.push(AGENT_STATUS.NEW_PROSPECT);

        return retval;
    }

    public getTaskStatuses(): TASK_STATUS[]{
        let retval: TASK_STATUS[] = [];

        retval.push(TASK_STATUS.NOT_STARTED);
        retval.push(TASK_STATUS.IN_PROGRESS);
        retval.push(TASK_STATUS.NEED_ASSISTANCE);
        retval.push(TASK_STATUS.DEFERRED);
        retval.push(TASK_STATUS.COMPLETED);

        return retval;
    }

    public getTaskPriorities(): TASK_PRIORITY[]{
        let retval: TASK_PRIORITY[] = [];

        retval.push(TASK_PRIORITY.HIGH);
        retval.push(TASK_PRIORITY.MEDIUM);
        retval.push(TASK_PRIORITY.LOW);
        retval.push(TASK_PRIORITY.NONE);

        return retval;
    }

    public getRoles(): Role[]{
        let retval: Role[] = [];

        retval.push(Role.ANONYMOUS);
        retval.push(Role.AGENT);
        retval.push(Role.CONTENT_ADMIN);
        retval.push(Role.MANAGER);
        retval.push(Role.MGA);
        retval.push(Role.PORTAL_ADMIN);
        retval.push(Role.REPORT_ADMIN);
        retval.push(Role.RMD);
        retval.push(Role.STORE_ADMIN);
        retval.push(Role.USER_ADMIN);

        return retval;
    }

    public getAppEntities(): APP_ENTITIES[]{
        let retval: APP_ENTITIES[] = [];

        retval.push(APP_ENTITIES.AGENT);
        retval.push(APP_ENTITIES.AGENCY);
        retval.push(APP_ENTITIES.CARRIER);
        retval.push(APP_ENTITIES.PROSPECT);

        return retval;
    }

    public getAppEvents(): APP_EVENTS[]{
        let retval: APP_EVENTS[] = [];

        retval.push(APP_EVENTS.CREATE);
        retval.push(APP_EVENTS.EDIT);
        retval.push(APP_EVENTS.DELETE);

        return retval;
    }

    public getProspectPriorities(): PROSPECT_PRIORITY[]{
        let retval: PROSPECT_PRIORITY[] = [];

        retval.push(PROSPECT_PRIORITY.HIGH);
        retval.push(PROSPECT_PRIORITY.MEDIUM);
        retval.push(PROSPECT_PRIORITY.LOW);
        retval.push(PROSPECT_PRIORITY.NONE);

        return retval;
    }

    public getAssociationTypes(): ASSOCIATION_TYPE[] {
        let retval: ASSOCIATION_TYPE[] = [];

        retval.push(ASSOCIATION_TYPE.BROTHER);
        retval.push(ASSOCIATION_TYPE.BUSINESS_PARTNER);
        retval.push(ASSOCIATION_TYPE.DAUGHTER);
        retval.push(ASSOCIATION_TYPE.FATHER);
        retval.push(ASSOCIATION_TYPE.FRIEND);
        retval.push(ASSOCIATION_TYPE.MOTHER);
        retval.push(ASSOCIATION_TYPE.SISTER);
        retval.push(ASSOCIATION_TYPE.SON);
        retval.push(ASSOCIATION_TYPE.SPOUSE);

        return retval;
    }
}