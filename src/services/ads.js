// 광고 노출 래퍼 - react-native-google-mobile-ads 연동

import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { INTERSTITIAL_ID, REWARDED_ID } from '../utils/adUnitIds';

// ── 전면 광고 (Interstitial) ──
// 퀴즈 3회 플레이마다 표시

let interstitial = null;
let interstitialLoaded = false;
let interstitialListeners = [];

function clearInterstitialListeners() {
  interstitialListeners.forEach(unsub => unsub?.());
  interstitialListeners = [];
}

function loadInterstitial() {
  clearInterstitialListeners();
  try {
    interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
    interstitialLoaded = false;

    interstitialListeners.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoaded = true;
      }),
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoaded = false;
        loadInterstitial();
      }),
      interstitial.addAdEventListener(AdEventType.ERROR, () => {
        interstitialLoaded = false;
        setTimeout(loadInterstitial, 10000);
      }),
    );

    interstitial.load();
  } catch (e) {
    console.warn('Interstitial load error:', e);
  }
}

export function showInterstitialAd() {
  try {
    if (interstitialLoaded && interstitial) {
      interstitial.show();
    } else {
      loadInterstitial();
    }
  } catch (e) {
    console.warn('Interstitial show error:', e);
  }
}

// ── 보상형 광고 (Rewarded) ──
// 레벨 변경 시 표시

export function showRewardedAd(onRewarded) {
  let listeners = [];
  try {
    const rewarded = RewardedAd.createForAdRequest(REWARDED_ID);
    let rewarding = false;

    const cleanup = () => {
      listeners.forEach(unsub => unsub?.());
      listeners = [];
    };

    listeners.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewarded.show();
      }),
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewarding = true;
      }),
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        cleanup();
        if (rewarding) onRewarded?.();
      }),
      rewarded.addAdEventListener(AdEventType.ERROR, () => {
        cleanup();
        onRewarded?.();
      }),
    );

    rewarded.load();
  } catch (e) {
    console.warn('Rewarded ad error:', e);
    onRewarded?.();
  }
}

// 앱 시작 시 전면 광고 미리 로드
try { loadInterstitial(); } catch (e) {}
