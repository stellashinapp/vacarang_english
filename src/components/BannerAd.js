import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAds } from '../context/AdsContext';

export default function BannerAd() {
  const { adsRemoved } = useAds();
  const insets = useSafeAreaInsets();
  if (adsRemoved) return null;
  return (
    <View style={[styles.banner, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>광고 영역 (SDK 연동 시 표시)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    height: 42,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 11, color: '#9ca3af' },
});
