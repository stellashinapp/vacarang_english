// 광고 노출 규칙 및 광고 제거 구매 상태

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADS_REMOVED_KEY = 'adsRemoved';
const INSTALL_DATE_KEY = 'appInstallDate';
const LAST_OPEN_DATE_KEY = 'appLastOpenDate';
const LAST_INTERSTITIAL_KEY = 'lastInterstitialTime';
const LAST_REWARDED_KEY = 'lastRewardedTime';

const INTERSTITIAL_INTERVAL_MS = 30 * 1000;
const REWARDED_INTERVAL_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const AdsContext = createContext(null);

export function AdsProvider({ children }) {
  const [adsRemoved, setAdsRemovedState] = useState(false);
  const [installDate, setInstallDate] = useState(null);
  const [lastOpenDate, setLastOpenDate] = useState(null);
  const [lastInterstitialTime, setLastInterstitialTime] = useState(0);
  const [lastRewardedTime, setLastRewardedTime] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [removed, install, lastOpen, lastInter, lastRew] = await Promise.all([
          AsyncStorage.getItem(ADS_REMOVED_KEY),
          AsyncStorage.getItem(INSTALL_DATE_KEY),
          AsyncStorage.getItem(LAST_OPEN_DATE_KEY),
          AsyncStorage.getItem(LAST_INTERSTITIAL_KEY),
          AsyncStorage.getItem(LAST_REWARDED_KEY),
        ]);
        if (removed === 'true') setAdsRemovedState(true);
        if (install) setInstallDate(Number(install));
        if (lastOpen) setLastOpenDate(lastOpen);
        if (lastInter) setLastInterstitialTime(Number(lastInter));
        if (lastRew) setLastRewardedTime(Number(lastRew));
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  const setAdsRemoved = useCallback(async (value) => {
    setAdsRemovedState(!!value);
    try {
      await AsyncStorage.setItem(ADS_REMOVED_KEY, value ? 'true' : 'false');
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        let install = installDate;
        if (install == null) {
          install = Date.now();
          await AsyncStorage.setItem(INSTALL_DATE_KEY, String(install));
          setInstallDate(install);
        }
        const today = new Date().toDateString();
        const last = lastOpenDate;
        if (Date.now() - install >= ONE_DAY_MS && last !== today) {
          try {
            const { showAppOpenAd } = require('../services/ads');
            showAppOpenAd();
          } catch (e) {}
        }
        await AsyncStorage.setItem(LAST_OPEN_DATE_KEY, today);
        setLastOpenDate(today);
      } catch (e) {}
    })();
  }, [ready]);

  const showInterstitial = useCallback(() => {
    if (adsRemoved) return;
    const now = Date.now();
    if (now - lastInterstitialTime < INTERSTITIAL_INTERVAL_MS) return;
    setLastInterstitialTime(now);
    AsyncStorage.setItem(LAST_INTERSTITIAL_KEY, String(now)).catch(() => {});
    try {
      const { showInterstitialAd } = require('../services/ads');
      showInterstitialAd();
    } catch (e) {}
  }, [adsRemoved, lastInterstitialTime]);

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

  return (
    <AdsContext.Provider value={{ adsRemoved, setAdsRemoved, showInterstitial, showRewarded }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}
