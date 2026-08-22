import CookieManager from '@preeternal/react-native-cookie-manager';

export async function clearAppCookies() { await CookieManager.clearAllStores(); }
