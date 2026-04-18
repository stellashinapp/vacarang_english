// 인앱결제 (광고 제거) - react-native-iap v15
import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  acknowledgePurchaseAndroid,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  flushFailedPurchasesCachedAsPendingAndroid,
} from 'react-native-iap';

const PRODUCT_ID = 'remove_ads';

export async function initIAP() {
  try {
    await initConnection();
    if (Platform.OS === 'android') {
      await flushFailedPurchasesCachedAsPendingAndroid();
    }
    return true;
  } catch (e) {
    console.warn('IAP init error:', e);
    return false;
  }
}

export async function closeIAP() {
  try { await endConnection(); } catch (e) {}
}

export async function getRemoveAdsProduct() {
  try {
    const products = await getProducts({ skus: [PRODUCT_ID] });
    return products?.[0] || null;
  } catch (e) {
    console.warn('Get products error:', e);
    return null;
  }
}

export async function purchaseRemoveAds() {
  try {
    await requestPurchase({ skus: [PRODUCT_ID], sku: PRODUCT_ID });
    return true;
  } catch (e) {
    console.warn('Purchase error:', e);
    return false;
  }
}

export async function restorePurchases() {
  try {
    const purchases = await getAvailablePurchases();
    const has = purchases.some(p => p.productId === PRODUCT_ID);
    if (has && Platform.OS === 'android') {
      for (const p of purchases) {
        if (p.productId === PRODUCT_ID && !p.isAcknowledgedAndroid) {
          await acknowledgePurchaseAndroid({ token: p.purchaseToken });
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
  const sub1 = purchaseUpdatedListener(async (purchase) => {
    if (purchase.productId === PRODUCT_ID) {
      try {
        if (Platform.OS === 'android') {
          await acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
        } else {
          await finishTransaction({ purchase });
        }
      } catch (e) {}
      onPurchased?.();
    }
  });
  const sub2 = purchaseErrorListener((error) => {
    console.warn('Purchase error:', error);
  });
  return () => { sub1?.remove(); sub2?.remove(); };
}
