// 광고 노출 규칙 및 광고 제거 구매 상태

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADS_REMOVED_KEY = 'adsRemoved';

const INTERSTITIAL_EVERY_N = 2;        // 전면광고: 2회 플레이마다 1회

const AdsContext = createContext(null);

export function AdsProvider({ children }) {
  const [adsRemoved, setAdsRemovedState] = useState(false);
  const playCount = useRef(0);
  const [ready, setReady] = useState(false);
  const appState = useRef(AppState.currentState);

  // 앱 초기화: 광고 제거 상태 로드 + 광고 SDK 초기화
  useEffect(() => {
    let isRemovedFromStorage = false;

    (async () => {
      try {
        const removed = await AsyncStorage.getItem(ADS_REMOVED_KEY);
        isRemovedFromStorage = removed === 'true';
        if (isRemovedFromStorage) setAdsRemovedState(true);
      } catch (e) {}
      setReady(true);

      // 광고 SDK 초기화 (광고 제거 구매 안 한 경우만)
      if (!isRemovedFromStorage) {
        try {
          const { initAds } = require('../services/ads');
          initAds();
        } catch (e) {}
      }

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

  // AppState 리스너: 백그라운드 → 포그라운드 복귀 시 광고 재로드
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // 포그라운드 복귀 시 광고 재로드
        if (!adsRemoved) {
          try {
            const { reloadAds } = require('../services/ads');
            reloadAds();
          } catch (e) {}
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  }, [adsRemoved]);

  const setAdsRemoved = useCallback(async (value) => {
    setAdsRemovedState(!!value);
    try {
      await AsyncStorage.setItem(ADS_REMOVED_KEY, value ? 'true' : 'false');
    } catch (e) {}
  }, []);

  // 전면광고: N회 플레이마다 표시
  const showInterstitial = useCallback((currentLevel) => {
    if (adsRemoved) return;
    // Lv.1 입문 단계는 광고 면제
    if (currentLevel === 1) return;

    playCount.current += 1;
    if (playCount.current % INTERSTITIAL_EVERY_N !== 0) return;

    try {
      const { showInterstitialAd } = require('../services/ads');
      showInterstitialAd();
    } catch (e) {}
  }, [adsRemoved]);

  // 보상형광고: 레벨 변경 시 호출 (광고 완료 후에만 콜백)
  const showRewarded = useCallback((onRewarded) => {
    if (adsRemoved) { onRewarded?.(); return; }

    try {
      const { showRewardedAd } = require('../services/ads');
      // ads.js에서 광고 시청 완료(EARNED_REWARD) 시에만 콜백 실행
      // 스킵/닫기 시 콜백 미실행 → 레벨 변경 불가
      showRewardedAd(onRewarded);
    } catch (e) { onRewarded?.(); }
  }, [adsRemoved]);

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
