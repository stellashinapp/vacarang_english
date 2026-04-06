import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FONT, COLORS, SHADOW } from '../utils/theme';
import { useAds } from '../context/AdsContext';
import { logShopEnter } from '../services/analytics';

const MAX_CONTENT_WIDTH = 480;

export default function RemoveAdsScreen({ onBack }) {
  const { adsRemoved, setAdsRemoved } = useAds();

  useEffect(() => {
    logShopEnter();
  }, []);

  const handlePurchase = () => {
    Alert.alert(
      '결제 준비 중',
      '광고 제거는 스토어 결제 연동 후 이용 가능합니다. 개발 중에는 구매가 완료되지 않습니다.',
      [{ text: '확인' }]
    );
  };

  return (
    <View style={styles.outer}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>광고 제거</Text>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.card}>
        <Text style={styles.icon}>🔇</Text>
        <Text style={styles.title}>광고 없이 이용하기</Text>
        <Text style={styles.desc}>
          배너, 전면 광고, 리워드 광고가 모두 제거됩니다.{'\n'}한 번 구매로 영구 적용됩니다.
        </Text>
        {adsRemoved ? (
          <View style={styles.purchasedBadge}>
            <Text style={styles.purchasedText}>✓ 구매 완료</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase} activeOpacity={0.8}>
            <Text style={styles.buyBtnText}>광고 제거 구매 (영구)</Text>
            <Text style={styles.priceText}>가격: 스토어 연동 후 표시</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { fontSize: 16, fontFamily: FONT.regular, color: COLORS.primary },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.text },
  card: {
    margin: 20,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontFamily: FONT.bold, color: COLORS.text, marginBottom: 8 },
  desc: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
  },
  buyBtnText: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.white },
  priceText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  purchasedBadge: { backgroundColor: COLORS.success, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  purchasedText: { fontSize: 15, fontFamily: FONT.bold, color: COLORS.white },
});
