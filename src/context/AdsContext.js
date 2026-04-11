// 광고 노출 규칙 및 광고 제거 구매 상태

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADS_REMOVED_KEY = 'adsRemoved';
const LAST_REWARDED_KEY = 'lastRewardedTime';

const INTERSTITIAL_EVERY_N = 2;        // 전면광고: 2회 플레이마다 1회
const REWARDED_INTERVAL_MS = 60 * 1000; // 보상형 최소 간격 60초

const AdsContext = createContext(null);

export function AdsProvider({ children }) {
  const [adsRemoved, setAdsRemovedState] = useState(false);
  const [lastRewardedTime, setLastRewardedTime] = useState(0);
  const playCount = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isRemovedFromStorage = false;

    (async () => {
      try {
        const [removed, lastRew] = await Promise.all([
          AsyncStorage.getItem(ADS_REMOVED_KEY),
          AsyncStorage.getItem(LAST_REWARDED_KEY),
        ]);
        isRemovedFromStorage = removed === 'true';
        if (isRemovedFromStorage) setAdsRemovedState(true);
        if (lastRew) setLastRewardedTime(Number(lastRew));
      } catch (e) {}
      setReady(true);

      // 앱 시작 시 이전 구매 자동 복원
      if (!isRemovedFromStorage) {
        try {
          const { initIAP, restorePurchases } = require('../services/iap');
          await initIAP();
          const restored = await restorePurchases();
          if (restored) {
            setAdsRemovedState(true);
            await AsyncStorage.setItem(ADS_REMOVED_KEY, 'true');
          }
        } catch (e) {}
      }
    })();
  }, []);

  const setAdsRemoved = useCallback(async (value) => {
    setAdsRemovedState(!!value);
    try {
      await AsyncStorage.setItem(ADS_REMOVED_KEY, value ? 'true' : 'false');
    } catch (e) {}
  }, []);

  // 전면광고: 3회 플레이마다 표시
  const showInterstitial = useCallback(() => {
    if (adsRemoved) return;
    playCount.current += 1;
    if (playCount.current % INTERSTITIAL_EVERY_N !== 0) return;
    try {
      const { showInterstitialAd } = require('../services/ads');
      showInterstitialAd();
    } catch (e) {}
  }, [adsRemoved]);

  // 보상형광고: 레벨 변경 시 호출
  const showRewarded = useCallback((onRewarded) => {
    if (adsRemoved) { onRewarded?.(); return; }
    const now = Date.now();
    if (now - lastRewardedTime < REWARDED_INTERVAL_MS) { onRewarded?.(); return; }
    setLastRewardedTime(now);
    AsyncStorage.setItem(LAST_REWARDED_KEY, String(now)).catch(() => {});
    try {
      const { showRewardedAd } = require('../services/ads');
      showRewardedAd(onRewarded);
    } catch (e) { onRewarded?.(); }
  }, [adsRemoved, lastRewardedTime]);

  // ready 전에는 children 렌더링하되 광고 안 보이도록
  return (
    <AdsContext.Provider value={{ adsRemoved: adsRemoved || !ready, setAdsRemoved, showInterstitial, showRewarded }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}
