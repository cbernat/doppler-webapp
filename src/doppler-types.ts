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
