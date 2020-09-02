import { HardcodedDopplerLegacyClient } from './doppler-legacy-client.doubles';
import { DopplerPlanClient } from './doppler-plan-client';

describe('Doppler plan client', () => {
  it('should validate if call to get data only once', async () => {
    // Arrange
    const dopplerLegacyClient = new HardcodedDopplerLegacyClient();
    const dopplerPlanClient = new DopplerPlanClient({ dopplerLegacyClient });
    const spyGetAllPlans = jest.spyOn(dopplerLegacyClient, 'getAllPlans');

    // Act
    await dopplerPlanClient.getPlanData();
    await dopplerPlanClient.getPlanData();

    // Assert
    expect(spyGetAllPlans).toHaveBeenCalledTimes(1);
  });
});
