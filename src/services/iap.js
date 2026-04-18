// 인앱결제 (광고 제거) - RevenueCat (react-native-purchases)
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const REVENUECAT_ANDROID_KEY = 'goog_WeuLweLADOfMGvWeotVeNCAaUAp';
const REVENUECAT_IOS_KEY = 'appl_YOUR_REVENUECAT_API_KEY';
const PRODUCT_ID = 'remove_ads';

let isInitialized = false;

export async function initIAP() {
  if (isInitialized) return true;
  try {
    const apiKey = Platform.OS === 'android' ? REVENUECAT_ANDROID_KEY : REVENUECAT_IOS_KEY;
    await Purchases.configure({ apiKey });
    isInitialized = true;
    return true;
  } catch (e) {
    console.warn('IAP init error:', e);
    return false;
  }
}

export async function closeIAP() {}

export async function getRemoveAdsProduct() {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (current && current.availablePackages.length > 0) {
      const pkg = current.availablePackages[0];
      return {
        localizedPrice: pkg.product.priceString,
        price: pkg.product.price,
        productId: pkg.product.identifier,
        _package: pkg,
      };
    }
    return null;
  } catch (e) {
    console.warn('Get products error:', e);
    return null;
  }
}

export async function purchaseRemoveAds() {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (current && current.availablePackages.length > 0) {
      const pkg = current.availablePackages[0];
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo.entitlements.active['remove_ads'] !== undefined;
    }
    return false;
  } catch (e) {
    if (e.userCancelled) return false;
    console.warn('Purchase error:', e);
    return false;
  }
}

export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['remove_ads'] !== undefined;
  } catch (e) {
    console.warn('Restore error:', e);
    return false;
  }
}

export function setupPurchaseListeners(onPurchased) {
  const listener = (customerInfo) => {
    if (customerInfo.entitlements.active['remove_ads']) {
      onPurchased?.();
    }
  };
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
