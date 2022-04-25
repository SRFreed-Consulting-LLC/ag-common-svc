import { BUSINESS_PERSONAL_TYPE } from "../../lists/business_personal_type.enum";

export class Social{
    id?: string;
    url?: String;
    social_media?: SOCIAL_MEDIA;
    social_type?: BUSINESS_PERSONAL_TYPE;
}

export enum SOCIAL_MEDIA {
    FB = "Facebook",
    IG = "Instagram",
    LI = "Linked In",
    TW = "Twitter"
}