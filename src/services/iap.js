// 인앱결제 (광고 제거) - react-native-iap v12
import { Platform } from 'react-native';

let RNIap = null;
try {
  RNIap = require('react-native-iap');
} catch (e) {
  console.warn('react-native-iap not available');
}

const PRODUCT_ID = 'remove_ads';

export async function initIAP() {
  if (!RNIap) return false;
  try {
    await RNIap.initConnection();
    if (Platform.OS === 'android') {
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid().catch(() => {});
    }
    return true;
  } catch (e) {
    console.warn('IAP init error:', e);
    return false;
  }
}

export async function closeIAP() {
  if (!RNIap) return;
  try { await RNIap.endConnection(); } catch (e) {}
}

export async function getRemoveAdsProduct() {
  if (!RNIap) return null;
  try {
    const products = await RNIap.getProducts({ skus: [PRODUCT_ID] });
    return products?.[0] || null;
  } catch (e) {
    console.warn('Get products error:', e);
    return null;
  }
}

export async function purchaseRemoveAds() {
  if (!RNIap) return false;
  try {
    await RNIap.requestPurchase({ skus: [PRODUCT_ID], sku: PRODUCT_ID });
    return true;
  } catch (e) {
    console.warn('Purchase error:', e);
    return false;
  }
}

export async function restorePurchases() {
  if (!RNIap) return false;
  try {
    const purchases = await RNIap.getAvailablePurchases();
    const has = purchases.some(p => p.productId === PRODUCT_ID);
    if (has && Platform.OS === 'android') {
      for (const p of purchases) {
        if (p.productId === PRODUCT_ID && !p.isAcknowledgedAndroid) {
          await RNIap.acknowledgePurchaseAndroid({ token: p.purchaseToken });
        }
      }
    }
    return has;
  } catch (e) {
    console.warn('Restore error:', e);
    return false;
  }
}

export function setupPurchaseListeners(onPurchased) {
  if (!RNIap) return () => {};
  const sub1 = RNIap.purchaseUpdatedListener(async (purchase) => {
    if (purchase.productId === PRODUCT_ID) {
      try {
        if (Platform.OS === 'android') {
          await RNIap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
        } else {
          await RNIap.finishTransaction({ purchase });
        }
      } catch (e) {}
      onPurchased?.();
    }
  });
  const sub2 = RNIap.purchaseErrorListener((error) => {
    console.warn('Purchase error:', error);
  });
  return () => { sub1?.remove(); sub2?.remove(); };
}
