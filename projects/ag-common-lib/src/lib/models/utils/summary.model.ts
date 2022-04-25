import { BaseModel } from "../base.model";

export class ReportSummary extends BaseModel {
    id: string;
    name?: string;
    type?: string;
    agencyId: string;
    year: number;
    
    agentStats?: ReportSummaryDetail;
    revenueStatsMonth?: ReportSummaryDetail[] = [];
    revenueStatsWeek?: ReportSummaryDetail[] = [];
    salesStats?: ReportSummaryDetail[] = [];

    rmds?: string[] = [];
    managerId?: string = '';
}

export class ReportSummaryDetail{
    name?: string;
    agencyId?: string;
    agencyName?: string;
    image?: string;
    year?: number=0;
    month?: number=0;
    week?: number=0;
    count?: number=0;
    faceAmt?: string= '0';
    lifeTotal?: string= '0';
    targetTotal?: string= '0';
    excessTotal?: string= '0';
    annuityTotal?: string= '0';
    sentinelTotal?: string= '0';
    outsideTotal?: string='0';
    countTotal?: string= '0';
    premiumTotal?: string= '0';
    transactions?: any[];
}