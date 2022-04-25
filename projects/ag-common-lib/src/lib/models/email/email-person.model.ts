export class EmailPerson {
    constructor(dbId: string, first_name: string, last_name: string, email_address: string, organization_name?: string){
        this.dbId = dbId;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email_address = email_address;
        if(organization_name) this.organization_name = organization_name;
    }

    dbId: string;
    first_name: string;
    last_name: string;
    email_address: string;
    organization_name?: string;
}