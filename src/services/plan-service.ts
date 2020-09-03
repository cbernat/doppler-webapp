import { DopplerLegacyClient } from './doppler-legacy-client';
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

  getPlans(userPlan: Plan, pathType: PathType, planType: PlanType): Plan[];
  // this method is to actually get a plans array with all options to show in slider, in this method we must ensure to call BE once
}

export class PlanService implements PlanHierarchy {
  private PlanList: Plan[] = [];
  private readonly dopplerLegacyClient: DopplerLegacyClient;

  constructor({ dopplerLegacyClient }: { dopplerLegacyClient: DopplerLegacyClient }) {
    this.dopplerLegacyClient = dopplerLegacyClient;
  }

  async ensurePlanListLoaded(): Promise<Plan[]> {
    return this.PlanList.length
      ? this.PlanList
      : (this.PlanList = await this.dopplerLegacyClient.getAllPlans());
  }

  private getMinimumFee(path:PathType):number{
    throw new Error('Not implemented');
  }

  private isHigherPlan(plan:Plan):boolean {
    throw new Error('Not implemented');
  }

  private getMinimumFeePrepaid(): number {
    throw new Error('Not implemented');
  }

  getPaths(userPlan: Plan): (FreePath | StandardPath | PlusPath | AgenciesPath)[] {
    const standardPath: StandardPath = {
      type: 'standard',
      actual: false,
      minimumFee: this.getMinimumFee('standard'),
      deadend: false,
    };
    const plusPath: PlusPath = {
      type: 'plus',
      actual: false,
      minimumFee: this.getMinimumFee('plus'),
      deadend: false,
    };
    const agenciesPath: AgenciesPath = {
      type: 'agencies',
      actual: false,
      deadend: true,
    };
    const currentDeadend = this.isHigherPlan(userPlan); 
    switch(userPlan.type){
      case('free'):
        const freePath: FreePath = {
          type: 'free',
          actual: true,
          deadend: true
        };
       return [freePath, standardPath, plusPath, agenciesPath];
      case('prepaid'):
        const currentStandard: StandardPath = {
          type: 'standard',
          actual: true,
          minimumFee: this.getMinimumFeePrepaid(), //minimum fee always
          deadend: false, // if we have more plans this is true for prepaid always
        };
        return [currentStandard, agenciesPath];
      case('subscribers'):
        const currentPlanFee = userPlan.fee;
        if (userPlan.featureSet === 'plus'){
          const currentplusPath: PlusPath = {
            type: 'plus',
            actual: true,
            minimumFee: currentPlanFee, // current plan fee
            deadend: currentDeadend, // if there is no possibility to advance
          };
          return [currentplusPath, agenciesPath];
        } else {
          const currentStandard: StandardPath = {
            type: 'standard',
            actual: true,
            minimumFee: currentPlanFee, //minimum fee always
            deadend: currentDeadend, // if we have more plans this is true for prepaid always
          };
          return [currentStandard, plusPath, agenciesPath]
        }
      default: // if it's agencies should not get here
        return []
    }
  }

  getPlanTypes(userPlan: Plan, pathType: PathType): PlanType[] {
    throw new Error('Not implemented');
  }

  getPlans(userPlan: Plan, pathType: PathType, planType: PlanType): Plan[] {
    throw new Error('Not implemented');
  }
}
