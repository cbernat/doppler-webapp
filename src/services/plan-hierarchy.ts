import {
  FreePath,
  StandardPath,
  PlusPath,
  AgenciesPath,
  PlanType,
  Plan,
  PathType,
} from '../doppler-types';

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

  getPlans(userPlan: Plan, pathType: PathType, planType: PlanType): Plan[];
  // this method is to actually get a plans array with all options to show in slider, in this method we must ensure to call BE once
}
