import { Injectable } from '@angular/core';
import { PREFIX } from 'ag-common-lib/lib/lists/prefixes.enum';
import { SUFFIX } from 'ag-common-lib/lib/lists/sufffixes.enum';
import {
  Address,
  Agency,
  Agent,
  AGENT_STATUS,
  AGENT_TYPE,
  Association,
  BUSINESS_PERSONAL_TYPE,
  COUNTRIES,
  EmailAddress,
  languages,
  ListManager,
  PhoneNumber,
  Prospect,
  PROSPECT_STATUS,
  SOCIAL_MEDIA
} from 'ag-common-lib/public-api';
import { Timestamp } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { PortalDataService } from '../../services/portal.service';
import { AgentService, ProspectService } from '../../../public-api';

@Injectable()
export class AgentEditorService {
  public countries = COUNTRIES;
  public languages = languages;

  public business_personal_types: BUSINESS_PERSONAL_TYPE[] = [
    BUSINESS_PERSONAL_TYPE.BUSINESS,
    BUSINESS_PERSONAL_TYPE.PERSONAL
  ];

  public social_media_type: SOCIAL_MEDIA[] = [SOCIAL_MEDIA.FB, SOCIAL_MEDIA.IG, SOCIAL_MEDIA.LI, SOCIAL_MEDIA.TW];

  individualCorpTypes: string[] = ['Individual', 'Corp'];
  lineOfBusinessTypes: string[] = ['Life', 'Annuity'];

  residencyTypes: string[] = ['Resident', 'Non-Resident'];

  public prospectStatuses: PROSPECT_STATUS[] = [];
  public agentStatuses: AGENT_STATUS[] = [];
  public agentTypes: AGENT_TYPE[] = [];
  public roles: any[] = [];

  prefixes: PREFIX[] = [];
  suffixes: SUFFIX[] = [];

  constructor(
    public portalDataService: PortalDataService,
    public listManager: ListManager,
    // public authService: AuthService,
    public agentService: AgentService,
    public prospectService: ProspectService,
    private toastrService: ToastrService
  ) {
    this.prospectStatuses = listManager.getProspectStatuses();
    this.agentStatuses = listManager.getAgentStatuses();
    this.agentTypes = listManager.getAgentTypes();
    this.roles = listManager.getRoles();
    this.prefixes = listManager.getPrefixes();
    this.suffixes = listManager.getSuffixes();
  }

  saveAgent(agent: Agent) {
    this.agentService.update(agent).then(() => {
      this.toastrService.success('Agent Successfully Updated!');
    });
  }

  saveProspect(prospect: Prospect) {
    prospect?.dbId &&
      this.prospectService.update(prospect).then(() => {
        this.toastrService.success('Prospect Successfully Updated!');
      });
  }

  getManager(managerId, managers: Agent[]) {
    if (managers && managerId) {
      let agents: Agent[] = managers.filter((agency) => agency.p_agent_id == managerId);

      if (agents.length == 1) {
        return agents[0].p_agent_name;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getAgency(agencyId, agencies: Agency[]) {
    if (agencies && agencyId) {
      let agency: Agency[] = agencies.filter((agency) => agency.agency_id == agencyId);

      if (agency.length == 1) {
        return agency[0].name;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  //used by dropdown OnValueChanged.
  //to use this.. place the number in the object passed into first param like this
  // {
  //      selectedItem:{
  //        number: xxxxxxxxxx
  //      }
  // }
  // where xxxxxxxxxx is the 10 digits for the number
  setPrimaryPhoneNumber(e, agent: Agent) {
    if (e.selectedItem.number) {
      agent.phone_numbers.forEach((phone_number) => {
        phone_number.is_primary = false;
      });

      let selected: PhoneNumber[] = agent.phone_numbers.filter((address) => address.number == e.selectedItem.number);

      if (selected.length == 1) {
        selected[0].is_primary = true;
      } else {
        console.log('more than 1');
      }
    } else {
      console.log('Could not set Primary Phone Number. First value must contain "e.selectedItem.number"', e);
    }
  }

  getPrimaryPhoneNumber(agent: Agent) {
    let phone_numbers: PhoneNumber[] = agent.phone_numbers.filter((number) => number.is_primary == true);

    if (phone_numbers.length == 1) {
      return this.getPhoneNumber(phone_numbers[0]);
    } else {
      return '';
    }
  }

  validatePhoneNumbers(agent: Agent) {
    if (agent.phone_numbers.length == 1) {
      agent.phone_numbers[0].is_primary = true;
    }
  }

  //used by dropdown OnValueChanged.
  //to use this.. place the email address in the object passed into first param like this
  // {
  //      selectedItem:{
  //        address: xxxxxxxxxx
  //      }
  // }
  // where xxxxxxxxxx is the email address
  setPrimaryEmailAddress(e, agent: Agent) {
    if (e?.selectedItem?.address) {
      agent.email_addresses.forEach((address) => {
        address.is_primary = false;
      });

      let selected: EmailAddress[] = agent.email_addresses.filter(
        (address) => address.address == e.selectedItem.address
      );

      if (selected.length == 1) {
        selected[0].is_primary = true;
      } else {
        console.log('more than 1');
      }
    } else {
      console.log('Could not set Primary Email Address. First value must contain "e.selectedItem.address"', e);
    }
  }

  getPrimaryEmailAddress(agent: Agent) {
    let emails: EmailAddress[] = agent.email_addresses.filter((address) => address.is_primary == true);

    if (emails.length == 1) {
      return emails[0].address;
    } else {
      return '';
    }
  }

  validateEmailAddresses(agent: Agent) {
    if (agent.email_addresses.length == 1) {
      agent.email_addresses[0].is_primary = true;
      agent.email_addresses[0].is_login = true;
    }
  }

  getPrimaryShippingAddress(agent: Agent) {
    if (agent.addresses) {
      let addresses: Address[] = agent.addresses.filter((address) => address.is_primary_shipping == true);
      if (addresses.length == 1) {
        let address = addresses[0];

        let retval = this.getFullAddress(address);

        return retval;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getPrimaryBillingAddress(agent: Agent) {
    if (agent.addresses) {
      let addresses: Address[] = agent.addresses.filter((address) => address.is_primary_billing == true);
      if (addresses.length == 1) {
        let address = addresses[0];

        let retval = this.getFullAddress(address);

        return retval;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  validateAddresses(agent: Agent) {
    if (agent.addresses.length == 1) {
      agent.addresses[0].is_primary_billing = true;
      agent.addresses[0].is_primary_shipping = true;
    }
  }

  setPrimary(e, collection: string, field: string, agent: Agent) {
    let incoming_id: string;

    let is_incoming_primary: boolean = false;

    if (e.data) {
      is_incoming_primary = e.data[field];
      incoming_id = e.data.id;
    } else {
      is_incoming_primary = e.newData[field];
      incoming_id = e.key;
    }

    if (is_incoming_primary) {
      agent[collection].forEach((item) => {
        if (item.id != incoming_id) {
          item[field] = false;
        }
      });
    }
  }

  getFullAddress(address: Address) {
    let retval = '';

    if (address) {
      if (address.address1) {
        retval += address.address1 + ' ';
      } else {
        retval += ' ';
      }
      if (address.address2) {
        retval += address.address2 + ' ';
      } else {
        retval += ' ';
      }
      if (address.city) {
        retval += address.city + ' ';
      } else {
        retval += ' ';
      }
      if (address.state) {
        retval += address.state + ' ';
      } else {
        retval += ' ';
      }
      if (address.zip) {
        retval += address.zip + ' ';
      } else {
        retval += ' ';
      }
    }

    return retval;
  }

  getShortAddress(address: Address) {
    let retval = this.getFullAddress(address);

    retval = retval.substr(0, 25);

    if (retval.length > 24) {
      retval += '...';
    }

    return retval;
  }

  getPhoneNumber(phoneNumber: PhoneNumber) {
    if (phoneNumber.number) {
      return (
        '(' +
        phoneNumber.number.substring(0, 3) +
        ') ' +
        phoneNumber.number.substring(3, 6) +
        '-' +
        phoneNumber.number.substring(6, 10)
      );
    } else {
      return '';
    }
  }

  getContactNumber(association: Association) {
    if (association.contact_number) {
      return (
        '(' +
        association.contact_number.substring(0, 3) +
        ') ' +
        association.contact_number.substring(3, 6) +
        '-' +
        association.contact_number.substring(6, 10)
      );
    } else {
      return '';
    }
  }

  getDisplayDate(date) {
    if (date instanceof Timestamp) {
      return new Date(date.toDate()).toLocaleDateString();
    } else {
      return new Date(date).toLocaleDateString();
    }
  }

  getYesNo(value: boolean) {
    if (value == true) {
      return 'Yes';
    } else {
      return 'No';
    }
  }

  validateUniqueness(collection: string, key: string, isEmail: boolean, agent: Agent, e) {
    if (isEmail) {
      e.data[key] = e.data[key].toLowerCase().trim();
    }

    let existingValue = agent[collection].filter((value) => value[key] == e.data[key]);

    if (existingValue.length > 0 && existingValue[0].id != e.data.id) {
      return Promise.resolve(false);
    } else {
      return Promise.resolve(true);
    }
  }

  generateAgentId(agent: Agent) {
    this.portalDataService
      .getNextAgentId()
      .then((id) => {
        agent.p_agent_id = String(id);
      })
      .catch((error) => {
        console.error('Error in Agent Admin.', error);
      });
  }

  lockEditorFields(e) {
    e.editorOptions.disabled =
      (e.parentType == 'dataRow' && (e.dataField == 'address' || e.dataField == 'is_login') && e.row.data.is_login) ||
      (e.dataField == 'is_primary' && e.row.data.is_primary) ||
      (e.dataField == 'is_primary_shipping' && e.row.data.is_primary_shipping) ||
      (e.dataField == 'is_primary_billing' && e.row.data.is_primary_billing);
  }

  canDeleteRow(e): boolean {
    if (
      e.row.data.is_login ||
      e.row.data.is_primary ||
      e.row.data.is_primary_billing ||
      e.row.data.is_primary_shipping
    ) {
      return false;
    } else {
      return true;
    }
  }

  initNewRow(e, type: string) {
    e.data.id = this.portalDataService.getUUID();

    if (type == 'email' || type == 'phone_number') {
      e.data.is_primary = false;
    }

    if (type == 'email') {
      e.data.is_login = false;
    }

    if (type == 'address') {
      e.data.is_primary_shipping = false;
      e.data.is_primary_billing = false;
    }

    if (type == 'association') {
      e.data.is_emergency_contact = false;
      e.data.address = { ...new Address() };
    }

    if (type == 'approve_deny_reason') {
      // TODO provide auth user data
      // e.data.created_by = this.authService.getAuthUserData().p_agent_name;
      e.data.created_date = new Date();
    }
  }
}
