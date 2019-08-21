import { AxiosStatic } from 'axios';
import { HttpDopplerAPIClient } from './doppler-api-client';
import { RefObject } from 'react';
import { AppSession } from './app-session';
import { DopplerLegacyUserData } from './doppler-legacy-client';

const consoleError = console.error;

function createHttpDopplerAPIClient(axios: any) {
  const axiosStatic = {
    create: () => axios,
  } as AxiosStatic;
  const connectionDataRef = {
    current: {
      status: 'authenticated',
      jwtToken: 'jwtToken',
      userData: { user: { email: 'email@mail.com' } } as DopplerLegacyUserData,
    },
  } as RefObject<AppSession>;
  const apiClient = new HttpDopplerAPIClient({
    axiosStatic,
    baseUrl: 'http://api.test',
    connectionDataRef,
  });
  return apiClient;
}

describe('HttpDopplerAPIClient', () => {
  beforeEach(() => {
    console.error = consoleError; // Restore console error logs
  });

  it('should set get subscriber amount from list correctly', async () => {
    // Arrange
    const listExist = {
      data: {
        listId: 27311899,
        name: 'Shopify Contacto',
        currentStatus: 'ready',
        subscribersCount: 3,
        creationDate: '2019-05-30T11:47:45.367Z',
      },
      status: 200,
    };
    const request = jest.fn(async () => listExist);
    const dopplerAPIClient = createHttpDopplerAPIClient({ request });

    // Act
    const result = await dopplerAPIClient.getListData(27311899);

    // Assert
    expect(request).toBeCalledTimes(1);
    expect(result).not.toBe(undefined);
    expect(result.success).toBe(true);
  });

  it('should set throw error when list does not exist', async () => {
    // Arrange
    const listNotExist = {
      data: {},
      status: 400,
      statusText: 'Error',
    };
    const request = jest.fn(async () => listNotExist);
    const dopplerAPIClient = createHttpDopplerAPIClient({ request });

    // Act
    const result = await dopplerAPIClient.getListData(27311899);

    // Assert
    expect(request).toBeCalledTimes(1);
    expect(result).not.toBe(undefined);
    expect(result.success).toBe(false);
  });
});
