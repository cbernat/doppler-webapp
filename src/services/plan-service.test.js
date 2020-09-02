import { HardcodedDopplerLegacyClient } from './doppler-legacy-client.doubles';
import { PlanService } from './plan-service';

describe('Doppler plan client', () => {
  it('should validate if call to get data only once', async () => {
    // Arrange
    const dopplerLegacyClient = new HardcodedDopplerLegacyClient();
    const planService = new PlanService({ dopplerLegacyClient });
    const spyGetAllPlans = jest.spyOn(dopplerLegacyClient, 'getAllPlans');

    // Act
    await planService.ensurePlanListLoaded();
    await planService.ensurePlanListLoaded();

    // Assert
    expect(spyGetAllPlans).toHaveBeenCalledTimes(1);
  });
});
