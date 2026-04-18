// 인앱결제 - 추후 연동 예정
export async function initIAP() { return false; }
export async function closeIAP() {}
export async function getRemoveAdsProduct() { return { localizedPrice: '₩3,900' }; }
export async function purchaseRemoveAds() { return false; }
export async function restorePurchases() { return false; }
export function setupPurchaseListeners(onPurchased) { return () => {}; }
