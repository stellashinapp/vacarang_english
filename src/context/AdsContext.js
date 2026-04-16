// 광고 노출 규칙 및 광고 제거 구매 상태

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const ADS_REMOVED_KEY = 'adsRemoved';
const LAST_REWARDED_KEY = 'lastRewardedTime';

const INTERSTITIAL_EVERY_N = 2;        // 전면광고: 2회 플레이마다 1회
const REWARDED_INTERVAL_MS = 60 * 1000; // 보상형 최소 간격 60초

const AdsContext = createContext(null);

// App 레벨에서 직접 호출 가능한 전역 ref
let _globalCurrentLevel = 1;
export function setGlobalCurrentLevel(lv) { _globalCurrentLevel = lv; }
export function getGlobalCurrentLevel() { return _globalCurrentLevel; }

export function AdsProvider({ children }) {
  const [adsRemoved, setAdsRemovedState] = useState(false);
  const [lastRewardedTime, setLastRewardedTime] = useState(0);
  const playCount = useRef(0);
  const [ready, setReady] = useState(false);
  const currentLevel = useRef(1);

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

  // 백그라운드 → 포그라운드 복귀 시 광고 재로드
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && !adsRemoved) {
        // 포그라운드 복귀 시 전면광고 재로드
        try {
          require('../services/ads');
        } catch (e) {}
      }
    });
    return () => sub?.remove();
  }, [adsRemoved]);

  const setAdsRemoved = useCallback(async (value) => {
    setAdsRemovedState(!!value);
    try {
      await AsyncStorage.setItem(ADS_REMOVED_KEY, value ? 'true' : 'false');
    } catch (e) {}
  }, []);

  // 현재 레벨 업데이트 함수
  const setCurrentLevel = useCallback((level) => {
    currentLevel.current = level;
    _globalCurrentLevel = level;
  }, []);

  // 전면광고: 2회 플레이마다 표시 (Lv.1은 제외)
  const showInterstitial = useCallback(() => {
    if (adsRemoved) return;
    if (currentLevel.current === 1) return; // Lv.1 광고 없음
    playCount.current += 1;
    if (playCount.current % INTERSTITIAL_EVERY_N !== 0) return;
    try {
      const { showInterstitialAd } = require('../services/ads');
      showInterstitialAd();
    } catch (e) {}
  }, [adsRemoved]);

  // 보상형광고: 레벨 변경 시 호출 (Lv.1은 제외)
  const showRewarded = useCallback((onRewarded) => {
    if (adsRemoved) { onRewarded?.(); return; }
    // Lv.1 → 다른 레벨은 광고 없이 이동 허용 (초기 진입 장벽 제거)
    if (currentLevel.current === 1) { onRewarded?.(); return; }
    const now = Date.now();
    if (now - lastRewardedTime < REWARDED_INTERVAL_MS) { onRewarded?.(); return; }
    setLastRewardedTime(now);
    AsyncStorage.setItem(LAST_REWARDED_KEY, String(now)).catch(() => {});
    try {
      const { showRewardedAd } = require('../services/ads');
      showRewardedAd(onRewarded);
    } catch (e) { onRewarded?.(); }
  }, [adsRemoved, lastRewardedTime]);

  return (
    <AdsContext.Provider value={{
      adsRemoved: adsRemoved || !ready,
      setAdsRemoved,
      showInterstitial,
      showRewarded,
      setCurrentLevel,
    }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}
