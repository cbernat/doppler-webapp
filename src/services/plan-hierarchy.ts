import { AdvancePayOptions, PlanType, PathType } from '../doppler-types';
export type Features =
  | 'emailParameter'
  | 'cancelCampaign'
  | 'siteTracking'
  | 'smartCampaigns'
  | 'shippingLimit';

export interface SubscribersLimitedPlan {
  type: 'subscribers';
  id: number;
  name: string;
  subscriberLimit: number;
  fee: number;
  featureSet: 'standard' | 'plus';
  featureList: Features[];
  billingCycleDetails: AdvancePayOptions[];
}

export interface MonthlyRenewalDeliveriesPlan {
  type: 'monthly-deliveries';
  id: number;
  name: string;
  emailsByMonth: number;
  extraEmailPrice: number;
  fee: number;
  featureSet: 'standard' | 'plus';
  featureList: Features[];
  billingCycleDetails: AdvancePayOptions[];
}

export interface PrepaidPack {
  type: 'prepaid';
  id: number;
  name: string;
  credits: number;
  price: number;
}

export interface FreePlan {
  type: 'free';
  subscriberLimit: 500;
}

export interface FreePath {
  type: 'free';
  actual: boolean;
  deadend: true;
}

export type Plan = SubscribersLimitedPlan | FreePlan | PrepaidPack | MonthlyRenewalDeliveriesPlan;

export interface StandardPath {
  type: 'standard';
  actual: boolean;
  minimumFee: number;
  deadend: boolean;
}

export interface PlusPath {
  type: 'plus';
  actual: boolean;
  minimumFee: number;
  deadend: boolean;
}

export interface AgenciesPath {
  type: 'agencies';
  actual: boolean;
  deadend: true;
}

export interface PlanHierarchy {
  //TODO: plan hierarchy should be implemented as singleton service

  getPaths(userPlan: PlanType): (FreePath | StandardPath | PlusPath | AgenciesPath)[];
  // current plan free: FreePath, StandardPath, PlusPath, AgenciesPath
  // current plan by credits: StandardPath, PlusPath, AgenciesPath
  // current plan standard: StandardPath, PlusPath, AgenciesPath
  // current plan plus: PlusPath, AgenciesPath

  getPlanTypes(userPlan: Plan, pathType: PathType): PlanType[];
  // get all plan types to be listed in slider: monthly-deliveries | subscribers | prepaid
  // Free and select standard -->'PrepaidPack' | 'MonthlyRenewalDeliveriesPlan' | 'SubscribersLimitedPlan'

  // Free and select plus --> 'MonthlyRenewalDeliveriesPlan' | 'SubscribersLimitedPlan'

  // By credits -->  'PrepaidPack' | 'MonthlyRenewalDeliveriesPlan' | 'SubscribersLimitedPlan' (we should confirm this option)

  // Standard and select standard (up contacts or up deliveries option) --> 'MonthlyRenewalDeliveriesPlan' | 'SubscribersLimitedPlan'

  // Standard and select plus --> 'MonthlyRenewalDeliveriesPlan' | 'SubscribersLimitedPlan'

  // plus and select plus (up contacts or up deliveries option) -->  'MonthlyRenewalDeliveriesPlan' | 'SubscribersLimitedPlan'

  getPlans(
    userPlan: Plan,
    pathType: PathType,
    planType: PlanType,
  ): (FreePlan | PrepaidPack | MonthlyRenewalDeliveriesPlan | SubscribersLimitedPlan)[];
  // this method is to actually get a plans array with all options to show in slider, in this method we must ensure to call BE once
}
