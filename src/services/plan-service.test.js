import { HardcodedDopplerLegacyClient } from './doppler-legacy-client.doubles';
import { PlanService } from './plan-service';

describe('Doppler plan client', () => {
  const dopplerLegacyClient = new HardcodedDopplerLegacyClient();
  const planService = new PlanService({ dopplerLegacyClient });

  it('should validate if call to get data only once', async () => {
    // Arrange
    const spyGetAllPlans = jest.spyOn(dopplerLegacyClient, 'getAllPlans');

    // Act
    await planService.ensurePlanListLoaded();
    await planService.ensurePlanListLoaded();

    // Assert
    expect(spyGetAllPlans).toHaveBeenCalledTimes(1);
  });

  it('should get correct path for a current free user', async () => {
    // Arrange
    const currentPlan = {
      type: 'free',
      subscriberLimit: 500,
    };

    // Act
    var paths = await planService.getPaths(currentPlan);

    // Assert
    expect(paths.length).toBe(4);
    expect(paths[0].actual).toBe(true);
    expect(paths[0].deadend).toBe(true);
  });

  it('should get correct path for a current prepaid user', async () => {
    // Arrange
    const currentPlan = { type: 'prepaid', id: 2, name: '2500-CREDITS', credits: 2500, price: 45 };

    // Act
    var paths = await planService.getPaths(currentPlan);

    // Assert
    expect(paths.length).toBe(3);
    expect(paths[0].actual).toBe(true);
    expect(paths[0].deadend).toBe(false);
  });

  it('should get correct path for a current subscriber standard user', async () => {
    // Arrange
    const currentPlan = {
      type: 'subscribers',
      id: 19,
      name: '2500-SUBSCRIBERS-STANDARD',
      subscriberLimit: 2500,
      fee: 29,
      featureSet: 'standard',
      featureList: [],
      billingCycleDetails: [
        { id: 8, idPlan: 19, paymentType: 'CC', discountPercentage: 0, billingCycle: 'monthly' },
      ],
    };

    // Act
    var paths = await planService.getPaths(currentPlan);
    console.log(JSON.stringify(paths));
    // Assert
    expect(paths.length).toBe(3);
    expect(paths[0].actual).toBe(true);
    expect(paths[0].deadend).toBe(false);
  });

  it('should get correct path for a current subscriber plus user', async () => {
    // Arrange
    const currentPlan = {
      type: 'subscribers',
      id: 19,
      name: '2500-SUBSCRIBERS-STANDARD',
      subscriberLimit: 2500,
      fee: 29,
      featureSet: 'plus',
      featureList: [],
      billingCycleDetails: [
        { id: 8, idPlan: 19, paymentType: 'CC', discountPercentage: 0, billingCycle: 'monthly' },
      ],
    };

    // Act
    var paths = await planService.getPaths(currentPlan);

    // Assert
    expect(paths.length).toBe(2);
    expect(paths[0].actual).toBe(true);
    expect(paths[0].deadend).toBe(false);
    expect(paths[0].minimumFee).toBe(currentPlan.fee);
  });
});
