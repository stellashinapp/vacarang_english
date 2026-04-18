// 인앱결제 - 웹 프리뷰용 스텁
export async function initIAP() { return false; }
export async function closeIAP() {}
export async function getRemoveAdsProduct() { return null; }
export async function purchaseRemoveAds() { return false; }
export async function restorePurchases() { return false; }
export function setupPurchaseListeners(onPurchased) { return () => {}; }
