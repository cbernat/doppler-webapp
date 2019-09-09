import { ResultWithoutExpectedErrors } from '../doppler-types';
import { AxiosInstance, AxiosStatic } from 'axios';
import { AppSession, ShopifyConnectionData } from './app-session';
import { RefObject } from 'react';
export enum SubscriberListState {
  ready,
  synchronizingContacts,
  notAvailable,
}

export interface SubscriberList {
  name: string;
  id: number;
  amountSubscribers: number;
  state: SubscriberListState;
}

export interface ConnectedShop {
  shopName: string;
  synchronization_date: Date | null;
  list: SubscriberList;
}

export interface ShopifyClient {
  getShopifyData(): Promise<ResultWithoutExpectedErrors<ConnectedShop[]>>;
}

export class HttpShopifyClient implements ShopifyClient {
  private readonly axios: AxiosInstance;
  private readonly baseUrl: string;
  private readonly connectionDataRef: RefObject<AppSession>;
  private etag: string;
  private cachedResponse?: any;

  constructor({
    axiosStatic,
    baseUrl,
    connectionDataRef,
    etag,
    cachedResponse,
  }: {
    axiosStatic: AxiosStatic;
    baseUrl: string;
    connectionDataRef: RefObject<AppSession>;
    etag?: string;
    cachedResponse?: any;
  }) {
    this.baseUrl = baseUrl;
    this.axios = axiosStatic.create({
      baseURL: this.baseUrl,
    });
    this.connectionDataRef = connectionDataRef;
    this.etag = etag ? etag : '';
    this.cachedResponse = cachedResponse ? cachedResponse : undefined;
  }

  private getShopifyConnectionData(): ShopifyConnectionData {
    const connectionData = this.connectionDataRef.current;
    if (!connectionData || connectionData.status !== 'authenticated' || !connectionData.jwtToken) {
      throw new Error('Shopify connection data is not available');
    }
    return connectionData;
  }

  private mapShop(response: any): ConnectedShop {
    return {
      shopName: response.shopName,
      synchronization_date: response.connectedOn,
      list: {
        id: response.dopplerListId,
        name: response.dopplerListName,
        amountSubscribers: response.importedCustomersCount,
        state:
          !!response.syncProcessInProgress && response.syncProcessInProgress !== 'false'
            ? SubscriberListState.synchronizingContacts
            : !!response.dopplerListId
            ? SubscriberListState.ready
            : SubscriberListState.notAvailable,
      },
    };
  }

  private reevaluateCurrentResponse(headers: any, formattedResponse: any) {
    let correctResponse;
    if (headers.etag && this.etag.length && headers.etag.includes(this.etag)) {
      correctResponse = this.cachedResponse;
    } else {
      correctResponse = formattedResponse;
      this.etag = headers.etag;
      this.cachedResponse = correctResponse;
    }
    return correctResponse;
  }

  public async getShopifyData(): Promise<ResultWithoutExpectedErrors<ConnectedShop[]>> {
    let currentResponse: ResultWithoutExpectedErrors<ConnectedShop[]>;
    try {
      const { jwtToken } = this.getShopifyConnectionData();
      const response = await this.axios.request({
        method: 'GET',
        url: `/me/shops`,
        headers: { Authorization: `token ${jwtToken}` },
      });

      if (response.data && response.data.length) {
        const connectedShops = response.data.map((shop: any) => {
          return this.mapShop(shop);
        });
        currentResponse = { success: true, value: connectedShops };
      } else {
        currentResponse = { success: true, value: [] };
      }
      currentResponse = this.reevaluateCurrentResponse(response.headers, currentResponse);
    } catch (error) {
      console.error(error);
      currentResponse = { success: false, error: error };
    }
    return currentResponse;
  }
}
