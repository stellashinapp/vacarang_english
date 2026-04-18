import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { FONT, COLORS, SHADOW } from '../utils/theme';
import { useAds } from '../context/AdsContext';
import { logShopEnter } from '../services/analytics';
import {
  initIAP,
  closeIAP,
  getRemoveAdsProduct,
  purchaseRemoveAds,
  restorePurchases,
  setupPurchaseListeners,
} from '../services/iap';

const MAX_CONTENT_WIDTH = 480;

export default function RemoveAdsScreen({ onBack }) {
  const { adsRemoved, setAdsRemoved } = useAds();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const cleanupRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    logShopEnter();
    mountedRef.current = true;

    (async () => {
      await initIAP();

      // 구매 완료 리스너
      cleanupRef.current = setupPurchaseListeners(() => {
        if (!mountedRef.current) return;
        setAdsRemoved(true);
        setPurchasing(false);
        Alert.alert('구매 완료', '광고가 영구적으로 제거되었습니다!');
      });

      if (!mountedRef.current) return;

      // 상품 정보 로드
      const p = await getRemoveAdsProduct();
      if (!mountedRef.current) return;
      setProduct(p);
      setLoading(false);

      // 이전 구매 복원 체크
      if (!adsRemoved) {
        const restored = await restorePurchases();
        if (mountedRef.current && restored) {
          setAdsRemoved(true);
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      cleanupRef.current?.();
      closeIAP();
    };
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    const success = await purchaseRemoveAds();
    if (!success) {
      setPurchasing(false);
      Alert.alert('준비 중', '광고 제거 구매 기능을 준비하고 있습니다.\n곧 업데이트 예정입니다!');
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const restored = await restorePurchases();
    setLoading(false);
    if (restored) {
      setAdsRemoved(true);
      Alert.alert('복원 완료', '광고 제거가 복원되었습니다!');
    } else {
      Alert.alert('복원 실패', '이전 구매 내역이 없습니다.');
    }
  };

  const priceText = product?.localizedPrice || product?.price || '가격 로딩 중...';

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
          배너, 전면 광고, 보상형 광고가 모두 제거됩니다.{'\n'}한 번 구매로 영구 적용됩니다.
        </Text>
        {adsRemoved ? (
          <View style={styles.purchasedBadge}>
            <Text style={styles.purchasedText}>✓ 구매 완료</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.buyBtn, purchasing && styles.buyBtnDisabled]}
              onPress={handlePurchase}
              activeOpacity={0.8}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.buyBtnText}>광고 제거 구매</Text>
                  <Text style={styles.priceText}>{priceText}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
              <Text style={styles.restoreText}>이전 구매 복원</Text>
            </TouchableOpacity>
          </>
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
    width: '100%',
  },
  buyBtnDisabled: { opacity: 0.6 },
  buyBtnText: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.white },
  priceText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  restoreBtn: {
    marginTop: 16,
    paddingVertical: 12,
  },
  restoreText: { fontSize: 14, fontFamily: FONT.semiBold, color: COLORS.primary },
  purchasedBadge: { backgroundColor: COLORS.success, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  purchasedText: { fontSize: 15, fontFamily: FONT.bold, color: COLORS.white },
});
