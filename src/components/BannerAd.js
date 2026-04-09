import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd as GADBannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../context/AdsContext';
import { BANNER_ID } from '../utils/adUnitIds';

export default function BannerAd() {
  const { adsRemoved } = useAds();
  const insets = useSafeAreaInsets();

  if (adsRemoved) return null;

  return (
    <View style={[styles.banner, { paddingBottom: insets.bottom || 4 }]}>
      <GADBannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
});
