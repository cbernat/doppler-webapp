import { DopplerLegacyClient } from './doppler-legacy-client';
import { PlanHierarchy } from './plan-hierarchy';
import {
  FreePath,
  StandardPath,
  PlusPath,
  AgenciesPath,
  PlanType,
  Plan,
  PathType,
} from '../doppler-types';

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

  getPaths(userPlan: PlanType): (FreePath | StandardPath | PlusPath | AgenciesPath)[] {
    throw new Error('Not implemented');
  }

  getPlanTypes(userPlan: Plan, pathType: PathType): PlanType[] {
    throw new Error('Not implemented');
  }

  getPlans(userPlan: Plan, pathType: PathType, planType: PlanType): Plan[] {
    throw new Error('Not implemented');
  }
}
