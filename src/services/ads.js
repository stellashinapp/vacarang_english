// 광고 노출 래퍼 - react-native-google-mobile-ads 연동 시 구현

export function showInterstitialAd() {}

export function showRewardedAd(onRewarded) {
  onRewarded?.();
}

export function showAppOpenAd() {}
