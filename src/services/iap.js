// 인앱결제 (광고 제거) - SDK 연동 예정
// react-native-iap 호환 문제로 추후 연동

export async function initIAP() { return false; }
export async function closeIAP() {}
export async function getRemoveAdsProduct() { return null; }
export async function purchaseRemoveAds() { return false; }
export async function restorePurchases() { return false; }
export function setupPurchaseListeners(onPurchased) { return () => {}; }
