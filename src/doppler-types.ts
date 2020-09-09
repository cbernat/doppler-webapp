export type UnexpectedError = { success?: false } | { success?: false; [key: string]: any };
export type ErrorResult<TError> = { success?: false; expectedError: TError } | UnexpectedError;
export type Result<TResult, TError> = { success: true; value: TResult } | ErrorResult<TError>;
export type ResultWithoutExpectedErrors<TResult> =
  | { success: true; value: TResult }
  | UnexpectedError;
export type EmptyResult<TError> = { success: true } | ErrorResult<TError>;
// It does not work:
// type EmptyResult = { success: true } | UnexpectedError;
// Duplicate identifier 'EmptyResult'.ts(2300)
// TODO: Research how to fix it and rename EmptyResultWithoutExpectedErrors as EmptyResult
export type EmptyResultWithoutExpectedErrors = { success: true } | UnexpectedError;

export type PathType = 'free' | 'standard' | 'plus' | 'agencies';

export type PlanType = 'free' | 'prepaid' | 'monthly-deliveries' | 'subscribers';

export type PaymentType = 'CC' | 'transfer';

export type BillingCycle = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export type Path = FreePath | StandardPath | PlusPath | AgenciesPath;

export interface AdvancePayOptions {
  id: number;
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
  featureSet: 'standard';
}

export interface FreePlan {
  type: 'free';
  subscriberLimit: 500;
  featureSet: 'free';
}

export interface AgencyPlan {
  type: 'agency';
  featureSet: 'agency';
}

export interface FreePath {
  type: 'free';
  actual: boolean;
  deadEnd: boolean;
}

export type Plan =
  | SubscribersLimitedPlan
  | FreePlan
  | PrepaidPack
  | MonthlyRenewalDeliveriesPlan
  | AgencyPlan;

export type FeaturedPlan = SubscribersLimitedPlan | MonthlyRenewalDeliveriesPlan;

export interface StandardPath {
  type: 'standard';
  actual: boolean;
  minimumFee: number;
  deadEnd: boolean;
}

export interface PlusPath {
  type: 'plus';
  actual: boolean;
  minimumFee: number;
  deadEnd: boolean;
}

export interface AgenciesPath {
  type: 'agencies';
  actual: boolean;
  deadEnd: boolean;
}

const getPrepaidPacks = (planList: Plan[]): PrepaidPack[] =>
  planList.filter((x) => x.type == 'prepaid') as PrepaidPack[];

const getUpgradeMonthlyPlans = (
  planList: Plan[],
  { minFee, minEmailsByMonth }: { minFee: number; minEmailsByMonth: number } = {
    minFee: 0,
    minEmailsByMonth: 0,
  },
): MonthlyRenewalDeliveriesPlan[] =>
  planList.filter(
    (x) => x.type == 'monthly-deliveries' && x.fee > minFee && x.emailsByMonth >= minEmailsByMonth,
  ) as MonthlyRenewalDeliveriesPlan[];

const getUpgradeSubscribersPlans = (
  planList: Plan[],
  { minFee, minSubscriberLimit }: { minFee: number; minSubscriberLimit: number } = {
    minFee: 0,
    minSubscriberLimit: 0,
  },
): SubscribersLimitedPlan[] =>
  planList.filter(
    (x) => x.type == 'subscribers' && x.fee > minFee && x.subscriberLimit >= minSubscriberLimit,
  ) as SubscribersLimitedPlan[];

const getFreePlans = (planList: Plan[]): FreePlan[] =>
  planList.filter((x) => x.type == 'free') as FreePlan[];

const getAgencyPlans = (planList: Plan[]): AgencyPlan[] =>
  planList.filter((x) => x.type == 'agency') as AgencyPlan[];

const getStandardPlans = (
  planList: Plan[],
): (MonthlyRenewalDeliveriesPlan | SubscribersLimitedPlan)[] =>
  planList.filter((x) => x.featureSet == 'standard') as (
    | MonthlyRenewalDeliveriesPlan
    | SubscribersLimitedPlan
  )[];

const getPlusPlans = (
  planList: Plan[],
): (MonthlyRenewalDeliveriesPlan | SubscribersLimitedPlan)[] =>
  planList.filter((x) => x.featureSet == 'plus') as (
    | MonthlyRenewalDeliveriesPlan
    | SubscribersLimitedPlan
  )[];

const getFreePathOrEmpty = (userPlan: Plan, planList: Plan[]): [] | [FreePath] => {
  var plans = getFreePlans(planList);

  if (plans.length == 0) {
    return [];
  }

  var cheapestPlan = plans[0];

  return [
    {
      type: 'free',
      actual: userPlan.featureSet == 'free',
      deadEnd: plans.length == 1 && userPlan == cheapestPlan,
    },
  ];
};

const getAgencyPathOrEmpty = (userPlan: Plan, planList: Plan[]): [] | [AgenciesPath] => {
  var plans = getAgencyPlans(planList);

  if (plans.length == 0) {
    return [];
  }

  var cheapestPlan = plans[0];

  return [
    {
      type: 'agencies',
      actual: userPlan.featureSet == 'agency',
      deadEnd: plans.length == 1 && userPlan == cheapestPlan,
    },
  ];
};

const getStandardPathOrEmpty = (userPlan: Plan, planList: Plan[]): [] | [StandardPath] => {
  var plans = getStandardPlans(planList).sort((x) => x.fee);

  if (plans.length == 0) {
    return [];
  }

  var cheapestPlan = plans[0];

  return [
    {
      type: 'standard',
      actual: userPlan.featureSet == 'standard',
      minimumFee: cheapestPlan.fee,
      deadEnd: plans.length == 1 && cheapestPlan == userPlan,
    },
  ];
};

const getPlusPathOrEmpty = (userPlan: Plan, planList: Plan[]): PlusPath[] => {
  var plans = getPlusPlans(planList).sort((x) => x.fee);

  if (plans.length == 0) {
    return [];
  }

  var cheapestPlan = plans[0];

  return [
    {
      type: 'plus',
      actual: userPlan.featureSet == 'plus',
      minimumFee: cheapestPlan.fee,
      deadEnd: plans.length == 1 && cheapestPlan == userPlan,
    },
  ];
};

const _agencyPlan: AgencyPlan = {
  type: 'agency',
  featureSet: 'agency',
};

export const getPaths = (userPlan: Plan, planList: Plan[]): Path[] => {
  // Assuming that planList does not contains 'free' and neither 'agency'
  const potentialUpgradePlans =
    userPlan.type == 'free'
      ? planList
      : userPlan.type == 'prepaid'
      ? [
          ...getPrepaidPacks(planList),
          ...getUpgradeMonthlyPlans(planList),
          ...getUpgradeSubscribersPlans(planList),
        ]
      : userPlan.type == 'monthly-deliveries'
      ? getUpgradeMonthlyPlans(planList, {
          minFee: userPlan.fee,
          minEmailsByMonth: userPlan.emailsByMonth,
        })
      : userPlan.type == 'subscribers'
        ? [
            ...getUpgradeSubscribersPlans(planList, {
              minFee: userPlan.fee,
              minSubscriberLimit: userPlan.subscriberLimit,
            }),
            ...getUpgradeMonthlyPlans(planList, {
              minFee: userPlan.fee,
              minEmailsByMonth: 0,
            }),
          ]
      : [];

  const potentialAndCurrentPlans = [userPlan, ...potentialUpgradePlans, _agencyPlan];

  return [
    ...getFreePathOrEmpty(userPlan, potentialAndCurrentPlans),
    ...getStandardPathOrEmpty(userPlan, potentialAndCurrentPlans),
    ...getPlusPathOrEmpty(userPlan, potentialAndCurrentPlans),
    ...getAgencyPathOrEmpty(userPlan, potentialAndCurrentPlans),
  ];
};
