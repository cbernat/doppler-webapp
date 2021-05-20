import { UtmCookiesManager } from './utm-cookies-manager';
function createLocalStorageDouble() {
  const items = {};
  const double = {
    setItem: (key, value) => {
      items[key] = value;
    },
    getItem: (key) => items[key],
    removeItem: (key) => {
      delete items[key];
    },
    clear: () => {
      items = {};
    },
    getAllItems: () => ({ ...items }),
  };
  return double;
}
const parse = JSON.parse;

const createJsonParse = (item) => {
  JSON.parse = jest.fn().mockImplementationOnce(() => {
    if (item) {
      const array = [];
      array.push(item);
      return array;
    }
    return [];
  });
};
describe('Utm cookies manager', () => {
  it('should initialize add only an entry per instance', () => {
    // Arrange
    const utmCookiesManager = new UtmCookiesManager();
    const location = { search: 'test', pathname: '/signup' };
    const storage = createLocalStorageDouble();
    createJsonParse();
    // Act
    utmCookiesManager.setCookieEntry(storage, location, '');
    utmCookiesManager.setCookieEntry(storage, location, '');
    // Assert
    JSON.parse = parse;
    expect(utmCookiesManager.getUtmCookie(storage).length).toBe(1);
  });

  it('should add direct as source when no referrer and no query', () => {
    // Arrange
    const utmCookiesManager = new UtmCookiesManager();
    const location = { search: 'test', pathname: '/signup' };
    const storage = createLocalStorageDouble();
    createJsonParse();
    // Act
    utmCookiesManager.setCookieEntry(storage, location, '');
    // Assert
    JSON.parse = parse;
    expect(utmCookiesManager.getUtmCookie(storage)[0].UTMSource).toBe('direct');
  });

  it('should add referrer when there is no query string in location', () => {
    // Arrange
    const utmCookiesManager = new UtmCookiesManager();
    const location = { search: 'test', pathname: '/signup' };
    const storage = createLocalStorageDouble();
    createJsonParse();
    // Act
    const referrerUrl = 'http://somereferrer.com';
    utmCookiesManager.setCookieEntry(storage, location, referrerUrl);
    // Assert
    JSON.parse = parse;
    expect(utmCookiesManager.getUtmCookie(storage)[0].UTMSource).toBe(referrerUrl);
  });

  it('should add utms in querys into utmCookie', () => {
    // Arrange
    const utmCookiesManager = new UtmCookiesManager();
    const location = {
      search: '?utm_source=source&utm_campaign=campaign&utm_medium=medium&utm_term=term',
      pathname: '/signup',
    };
    const storage = createLocalStorageDouble();
    createJsonParse();
    // Act
    utmCookiesManager.setCookieEntry(storage, location, '');
    // Assert
    JSON.parse = parse;
    expect(utmCookiesManager.getUtmCookie(storage)[0].UTMSource).toBe('source');
  });
});
