export interface AdvancePayOptions {
  id: number;
  idPlan: number;
  paymentType: 'CC' | 'transfer';
  discountPercentage: number;
  billingCycle: BillingCycle;
}
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

export type Plan = SubscribersLimitedPlan | FreePlan | PrepaidPack | MonthlyRenewalDeliveriesPlan;

export interface FreePath {
  type: 'free';
  actual: boolean;
  deadend: true;
}

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

export type PathType = 'free' | 'standard' | 'plus' | 'agencies';

export type PlanType = 'free' | 'prepaid' | 'monthly-deliveries' | 'subscribers';

export type PaymentType = 'CC' | 'transfer';

export type BillingCycle = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

// dictionaries
export const planTypeByIdUserType: { [idUserType: number]: PlanType } = {
  1: 'free',
  2: 'monthly-deliveries',
  3: 'prepaid',
  4: 'subscribers',
};

export const pathTypeByType: { [type: number]: PathType } = {
  1: 'free',
  2: 'standard',
  3: 'plus',
};

export const paymentTypeByPaymentMethod: { [paymentMehtod: number]: PaymentType } = {
  1: 'CC',
  3: 'transfer',
};

export const monthPlanByBillingCycle: { [paymentMehtod: number]: BillingCycle } = {
  1: 'monthly',
  3: 'quarterly',
  6: 'half-yearly',
  12: 'yearly',
};
// end dictionaries

export interface PlanHierarchy {
  //TODO: plan hierarchy should be implemented as singleton service

  getPaths(userPlan: Plan): (FreePath | StandardPath | PlusPath | AgenciesPath)[];
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
