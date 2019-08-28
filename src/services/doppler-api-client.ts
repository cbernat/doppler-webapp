import { ResultWithoutExpectedErrors } from '../doppler-types';
import { AxiosInstance, AxiosStatic } from 'axios';
import { AppSession, DopplerAPIConnectionData } from './app-session';
import { RefObject } from 'react';
import { SubscriberList, SubscriberListState } from './shopify-client';

export interface DopplerAPIClient {
  getListData(idList: number, apikey: string): Promise<ResultWithoutExpectedErrors<SubscriberList>>;
}

export class HttpDopplerAPIClient implements DopplerAPIClient {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;
  private readonly connectionDataRef: RefObject<AppSession>;

  constructor({
    axiosStatic,
    baseUrl,
    connectionDataRef,
  }: {
    axiosStatic: AxiosStatic;
    baseUrl: string;
    connectionDataRef: RefObject<AppSession>;
  }) {
    this.baseUrl = baseUrl;
    this.axios = axiosStatic.create({
      baseURL: this.baseUrl,
    });
    this.connectionDataRef = connectionDataRef;
  }

  private getDopplerAPIConnectionData(): DopplerAPIConnectionData {
    const connectionData = this.connectionDataRef.current;
    if (
      !connectionData ||
      connectionData.status !== 'authenticated' ||
      !connectionData.jwtToken ||
      !connectionData.userData
    ) {
      throw new Error('Doppler API connection data is not available');
    }
    return { jwtToken: connectionData.jwtToken, userAccount: connectionData.userData.user.email };
  }

  private mapList(data: any): SubscriberList {
    return {
      name: data.name,
      id: data.listId,
      amountSubscribers: data.subscribersCount,
      state:
        data.currentStatus === SubscriberListState.ready
          ? SubscriberListState.ready
          : SubscriberListState.synchronizingContacts,
    };
  }

  public async getListData(
    listId: number,
    apikey: string,
  ): Promise<ResultWithoutExpectedErrors<SubscriberList>> {
    try {
      // eslint-disable-next-line
      const { jwtToken, userAccount } = this.getDopplerAPIConnectionData();
      const response = await this.axios.request({
        method: 'GET',
        url: `https://restapi.fromdoppler.com/accounts/${userAccount}/lists/${listId}?api_key=${apikey}`,
        //headers: { Authorization: `token ${jwtToken}` }, // This line will remain commented until jwtToken is enabled for dopplerAPI
      });
      if (response.status === 200 && response.data) {
        return { success: true, value: this.mapList(response.data) };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      return { success: false, error: error };
    }
  }
}
