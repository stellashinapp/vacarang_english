// 광고 노출 래퍼 - react-native-google-mobile-ads 연동

import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AppState } from 'react-native';
import { INTERSTITIAL_ID, REWARDED_ID } from '../utils/adUnitIds';

// ── 전면 광고 (Interstitial) ──

let interstitial = null;
let interstitialLoaded = false;
let interstitialListeners = [];

function clearInterstitialListeners() {
  interstitialListeners.forEach(unsub => unsub?.());
  interstitialListeners = [];
}

function loadInterstitial() {
  clearInterstitialListeners();
  interstitialLoaded = false;
  try {
    interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

    interstitialListeners.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoaded = true;
      }),
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoaded = false;
        interstitial = null;
        // 닫힌 후 새 광고 로드
        setTimeout(loadInterstitial, 1000);
      }),
      interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        interstitialLoaded = false;
        interstitial = null;
        console.warn('Interstitial error:', error);
        setTimeout(loadInterstitial, 15000);
      }),
    );

    interstitial.load();
  } catch (e) {
    console.warn('Interstitial load error:', e);
    setTimeout(loadInterstitial, 15000);
  }
}

export function showInterstitialAd() {
  try {
    if (interstitialLoaded && interstitial) {
      interstitial.show();
    } else {
      // 로드 안 되어 있으면 다시 로드 시도
      loadInterstitial();
    }
  } catch (e) {
    console.warn('Interstitial show error:', e);
    loadInterstitial();
  }
}

// ── 보상형 광고 (Rewarded) ──

export function showRewardedAd(onRewarded) {
  let listeners = [];
  let rewarding = false;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    listeners.forEach(unsub => unsub?.());
    listeners = [];
  };

  try {
    const rewarded = RewardedAd.createForAdRequest(REWARDED_ID);

    // 10초 타임아웃 - 로드 실패 시 콜백 호출하지 않음 (스킵 방지)
    const timeout = setTimeout(() => {
      cleanup();
      // 타임아웃 시에도 콜백 호출하지 않음 → 레벨 변경 불가
    }, 10000);

    listeners.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        clearTimeout(timeout);
        rewarded.show();
      }),
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewarding = true;
      }),
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        clearTimeout(timeout);
        cleanup();
        // 보상을 받은 경우에만 콜백 실행
        if (rewarding) {
          onRewarded?.();
        }
        // 스킵한 경우 → 콜백 미실행 → 레벨 변경 안 됨
      }),
      rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        clearTimeout(timeout);
        cleanup();
        console.warn('Rewarded ad error:', error);
        // 에러 시에는 사용자 편의를 위해 통과
        onRewarded?.();
      }),
    );

    rewarded.load();
  } catch (e) {
    console.warn('Rewarded ad error:', e);
    onRewarded?.();
  }
}

// ── 앱 시작 시 전면 광고 미리 로드 ──
try { loadInterstitial(); } catch (e) {}

// ── 백그라운드 → 포그라운드 복귀 시 광고 재로드 ──
AppState.addEventListener('change', (nextState) => {
  if (nextState === 'active') {
    // 포그라운드 복귀 시 전면 광고가 안 되어있으면 재로드
    if (!interstitialLoaded) {
      setTimeout(loadInterstitial, 2000);
    }
  }
});
