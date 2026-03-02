// 결과 화면 (독립 화면으로 사용 시)
// 대부분의 게임은 자체 결과 화면을 가지고 있으므로 이건 보조용

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FONT, COLORS } from "../utils/theme";
import { useAds } from "../context/AdsContext";

const MAX_CONTENT_WIDTH = 480;

function withInterstitial(fn, showInterstitial) {
  return () => {
    showInterstitial();
    fn?.();
  };
}

export default function ResultScreen({
  result,
  wrongWords,
  onRetry,
  onMenu,
  onHome,
  onNextStage,
}) {
  const { showInterstitial, showRewarded } = useAds();

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>결과 없음</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={withInterstitial(onMenu, showInterstitial)}
        >
          <Text style={styles.btnText}>메뉴로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleNextStage = () => {
    showRewarded(() => onNextStage?.());
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 72 }}>{result.emoji || "🎮"}</Text>
      <Text style={styles.title}>{result.title || "게임 완료!"}</Text>
      <Text style={styles.stat}>
        {result.score}/{result.total} 정답
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.btn}
          onPress={withInterstitial(onRetry, showInterstitial)}
        >
          <Text style={styles.btnText}>다시 하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSec}
          onPress={withInterstitial(onMenu, showInterstitial)}
        >
          <Text style={styles.btnSecText}>메뉴로</Text>
        </TouchableOpacity>
      </View>

      {onNextStage && (
        <TouchableOpacity
          style={[styles.btn, styles.btnReward]}
          onPress={handleNextStage}
        >
          <Text style={styles.btnText}>다음 단계로 (광고 시청)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: FONT.bold,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  stat: { fontSize: 18, fontFamily: FONT.medium, color: COLORS.textSecondary },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  btnText: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.white },
  btnSec: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnSecText: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: COLORS.textSecondary,
  },
  btnReward: { marginTop: 12 },
});
