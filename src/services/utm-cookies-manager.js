import { extractParameter } from '../utils';
import queryString from 'query-string';
export class UtmCookiesManager {
  constructor() {
    this.hasRegistered = false;
  }

  getParameter(location, parameter) {
    return extractParameter(location, queryString.parse, parameter);
  }

  getSource(location, referrer) {
    let utmSource = this.getParameter(location, 'utm_source');
    if (!utmSource) {
      utmSource = referrer || 'direct';
    }
    return utmSource;
  }

  setCookieEntry(storage, location, referrer) {
    if (!this.hasRegistered) {
      let utmCookies = JSON.parse(storage.getItem('UtmCookies'));
      if (!utmCookies) {
        utmCookies = [];
      }
      const utmSource = this.getSource(location, referrer);
      const utmCampaign = this.getParameter(location, 'utm_campaign');
      const utmMedium = this.getParameter(location, 'utm_medium');
      const utmTerm = this.getParameter(location, 'utm_term');
      const newItem = {
        date: new Date().toISOString(),
        UTMSource: utmSource,
        UTMCampaign: utmCampaign,
        UTMMedium: utmMedium,
        UTMTerm: utmTerm,
      };
      utmCookies.push(newItem);

      storage.setItem('UtmCookies', JSON.stringify(utmCookies.slice(-10)));

      this.hasRegistered = true;
    }
  }

  getUtmCookie(storage) {
    return JSON.parse(storage.getItem('UtmCookies'));
  }
}
