// AdMob 광고 연동 - react-native-google-mobile-ads
// 전면광고(Interstitial) + 보상형광고(Rewarded) 로드/표시/재로드

import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { INTERSTITIAL_ID, REWARDED_ID } from '../utils/adUnitIds';

// ── 전면광고 ──────────────────────────────────────────
let interstitial = null;
let interstitialLoaded = false;
let interstitialLoading = false;

function createInterstitial() {
  if (interstitial) {
    // 기존 리스너 정리
    try { interstitial.removeAllListeners(); } catch (e) {}
  }

  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
  interstitialLoaded = false;
  interstitialLoading = false;

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
    interstitialLoading = false;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    // 광고 닫힌 후 다음 광고 미리 로드
    interstitialLoaded = false;
    interstitialLoading = false;
    loadInterstitial();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.warn('Interstitial ad error:', error);
    interstitialLoaded = false;
    interstitialLoading = false;
    // 5초 후 재시도
    setTimeout(loadInterstitial, 5000);
  });
}

export function loadInterstitial() {
  if (interstitialLoaded || interstitialLoading) return;
  if (!interstitial) createInterstitial();
  interstitialLoading = true;
  try {
    interstitial.load();
  } catch (e) {
    console.warn('Interstitial load failed:', e);
    interstitialLoading = false;
  }
}

export function showInterstitialAd() {
  if (interstitialLoaded && interstitial) {
    try {
      interstitial.show();
    } catch (e) {
      console.warn('Interstitial show failed:', e);
      // 새로 생성하고 로드
      createInterstitial();
      loadInterstitial();
    }
  } else {
    // 로드 안 됐으면 다음을 위해 로드
    loadInterstitial();
  }
}

// ── 보상형 광고 ──────────────────────────────────────
let rewarded = null;
let rewardedLoaded = false;
let rewardedLoading = false;
let rewardedCallback = null;
let rewardEarned = false;

function createRewarded() {
  if (rewarded) {
    try { rewarded.removeAllListeners(); } catch (e) {}
  }

  rewarded = RewardedAd.createForAdRequest(REWARDED_ID);
  rewardedLoaded = false;
  rewardedLoading = false;

  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewardedLoaded = true;
    rewardedLoading = false;
  });

  rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    // 보상 획득 (광고 시청 완료)
    rewardEarned = true;
  });

  rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    // 광고 닫힘 - 보상을 획득한 경우에만 콜백 실행
    if (rewardEarned && rewardedCallback) {
      rewardedCallback();
    }
    rewardedCallback = null;
    rewardEarned = false;
    rewardedLoaded = false;
    rewardedLoading = false;
    // 다음 광고 미리 로드
    loadRewarded();
  });

  rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
    console.warn('Rewarded ad error:', error);
    // 광고 로드 실패 시 콜백 실행 (사용자 블로킹 방지)
    if (rewardedCallback) {
      rewardedCallback();
      rewardedCallback = null;
    }
    rewardedLoaded = false;
    rewardedLoading = false;
    setTimeout(loadRewarded, 5000);
  });
}

export function loadRewarded() {
  if (rewardedLoaded || rewardedLoading) return;
  if (!rewarded) createRewarded();
  rewardedLoading = true;
  try {
    rewarded.load();
  } catch (e) {
    console.warn('Rewarded load failed:', e);
    rewardedLoading = false;
  }
}

export function showRewardedAd(onRewarded) {
  if (rewardedLoaded && rewarded) {
    rewardedCallback = onRewarded;
    rewardEarned = false;
    try {
      rewarded.show();
    } catch (e) {
      console.warn('Rewarded show failed:', e);
      onRewarded?.();
      createRewarded();
      loadRewarded();
    }
  } else {
    // 광고 로드 안 됐으면 바로 콜백 (사용자 블로킹 방지)
    onRewarded?.();
    loadRewarded();
  }
}

// ── 초기화 ──────────────────────────────────────────
export function initAds() {
  createInterstitial();
  createRewarded();
  loadInterstitial();
  loadRewarded();
}

// 백그라운드 복귀 시 광고 재로드
export function reloadAds() {
  if (!interstitialLoaded && !interstitialLoading) {
    createInterstitial();
    loadInterstitial();
  }
  if (!rewardedLoaded && !rewardedLoading) {
    createRewarded();
    loadRewarded();
  }
}
