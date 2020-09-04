import { DopplerLegacyClient } from './doppler-legacy-client';
import {
  FreePath,
  StandardPath,
  PlusPath,
  AgenciesPath,
  PlanType,
  Plan,
  PathType,
  Path,
  FeaturedPlan,
} from '../doppler-types';
import { getPlanFee } from '../utils';

export interface PlanHierarchy {
  getPaths(userPlan: Plan): Promise<Path[]>;
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

  private getPlanPath(plan: Plan): PathType {
    return plan.type === 'prepaid' || plan.type === 'free'
      ? 'standard'
      : (plan as FeaturedPlan).featureSet;
  }

  private getMinimumFee(planList: Plan[], path: PathType): number {
    const allFees: number[] = planList
      .filter((plan) => this.getPlanPath(plan) === path)
      .map(getPlanFee);
    return allFees.length ? Math.min(...allFees) : 0;
  }

  private isHigherPlanForPath(planList: Plan[], currentPlan: Plan): boolean {
    const allFeesByTypeAndPath: number[] = planList
      .filter((plan) => this.getPlanPath(plan) === this.getPlanPath(currentPlan))
      .map(getPlanFee);
    return getPlanFee(currentPlan) === Math.max(...allFeesByTypeAndPath);
  }

  private getMinimumFeePrepaid(planList: Plan[]): number {
    const allFeesByPrepaid: number[] = planList
      .filter((plan) => plan.type === 'prepaid')
      .map((plan) => getPlanFee(plan));
    return Math.min(...allFeesByPrepaid);
  }

  private createFreePath(): FreePath {
    return {
      type: 'free',
      actual: true,
      deadend: true,
    };
  }

  private createAgenciesPath(): AgenciesPath {
    return {
      type: 'agencies',
      actual: false,
      deadend: true,
    };
  }

  private createPlusPath(actual: boolean, minimumFee: number, deadEnd: boolean): PlusPath {
    return {
      type: 'plus',
      actual: actual,
      minimumFee: minimumFee,
      deadend: deadEnd,
    };
  }

  private createStandardPath(actual: boolean, minimumFee: number, deadEnd: boolean): StandardPath {
    return {
      type: 'standard',
      actual: actual,
      minimumFee: minimumFee,
      deadend: deadEnd,
    };
  }

  async getPaths(userPlan: Plan): Promise<Path[]> {
    const planList = await this.ensurePlanListLoaded();

    const defaultplusPath: PlusPath = this.createPlusPath(
      false,
      this.getMinimumFee(planList, 'plus'),
      false,
    );
    const defaultAgenciesPath: AgenciesPath = this.createAgenciesPath();

    switch (userPlan.type) {
      case 'free':
        const freePath: FreePath = this.createFreePath();
        const standardPath: StandardPath = this.createStandardPath(
          false,
          this.getMinimumFee(planList, 'standard'),
          false,
        );

        return [freePath, standardPath, defaultplusPath, defaultAgenciesPath];

      case 'prepaid':
        const currentStandard: StandardPath = this.createStandardPath(
          true,
          this.getMinimumFeePrepaid(planList),
          false,
        );

        return [currentStandard, defaultplusPath, defaultAgenciesPath];

      case 'subscribers':
      case 'monthly-deliveries':
        const currentPlanFee = userPlan.fee;
        if (userPlan.featureSet === 'plus') {
          const currentplusPath: PlusPath = this.createPlusPath(
            true,
            currentPlanFee,
            this.isHigherPlanForPath(planList, userPlan),
          );
          return [currentplusPath, defaultAgenciesPath];
        } else {
          const currentStandard: StandardPath = this.createStandardPath(
            true,
            currentPlanFee,
            this.isHigherPlanForPath(planList, userPlan),
          );

          return [currentStandard, defaultplusPath, defaultAgenciesPath];
        }
      default:
        // if it's agencies should not get here
        return [];
    }
  }

  getPlanTypes(userPlan: Plan, pathType: PathType): PlanType[] {
    throw new Error('Not implemented');
  }

  getPlans(userPlan: Plan, pathType: PathType, planType: PlanType): Plan[] {
    throw new Error('Not implemented');
  }
}
