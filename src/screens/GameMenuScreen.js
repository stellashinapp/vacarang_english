// 게임 모드 선택 화면

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONT, COLORS, SHADOW, RADIUS } from "../utils/theme";
import { LEVEL_INFO } from "../data/words";
import OrangeHeaderCharacter from "../components/OrangeHeaderCharacter";
import { logMenuFirstEnter } from "../services/analytics";

const HEADER_PURPLE = "#7B6BDF";
const HEADER_PURPLE_DARK = "#5A4ABD";
const GAP = 10;

const MODES = [
  {
    id: "emoji",
    label: "이모지 퀴즈",
    icon: "🎯",
    desc: "이모지를 보고 영어 단어 맞추기",
  },
  {
    id: "ko2en",
    label: "한→영 퀴즈",
    icon: "🇰🇷",
    desc: "한국어를 보고 영어 맞추기",
  },
  {
    id: "en2ko",
    label: "영→한 퀴즈",
    icon: "🇬🇧",
    desc: "영어를 보고 한국어 맞추기",
  },
  {
    id: "listen",
    label: "듣기 퀴즈",
    icon: "👂",
    desc: "발음을 듣고 단어 맞추기",
  },
  { id: "spell", label: "스펠링", icon: "✏️", desc: "영어 단어 철자 맞추기" },
  {
    id: "match",
    label: "카드 매칭",
    icon: "🃏",
    desc: "짝을 찾아 카드 뒤집기",
  },
];

export default function GameMenuScreen({
  level,
  onStart,
  onChangeLevel,
  onWordList,
  onWrongNote,
  onBack,
  onShop,
  wrongWords,
  words,
}) {
  const info = LEVEL_INFO.find((l) => l.level === level);
  const wrongCount = Object.values(wrongWords).filter((w) =>
    words.some((ww) => ww.en === w.word.en),
  ).length;

  // 메뉴 첫 진입 시 로그 (레벨별 1회)
  useEffect(() => {
    const key = `analytics_menu_first_enter_level_${level}`;
    AsyncStorage.getItem(key).then((v) => {
      if (v !== "1") {
        logMenuFirstEnter(level, "game_menu");
        AsyncStorage.setItem(key, "1");
      }
    });
  }, [level]);

  return (
    <View style={styles.outerContainer}>
      {/* 보라 헤더: 전체 너비로 확장 */}
      <LinearGradient
        colors={[HEADER_PURPLE_DARK, HEADER_PURPLE]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.backRow}
      >
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← 뒤로</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={[HEADER_PURPLE_DARK, HEADER_PURPLE]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.topHeader}
      >
        <View style={styles.headerInnerRow}>
          <View style={styles.headerTextArea}>
            <Text style={styles.headerTitleWhite}>어떤 퀴즈에 도전할까요?</Text>
            <Text style={styles.headerSubWhite}>
              나에게 필요한 학습 모드를 골라보세요.
            </Text>
          </View>
          <View style={styles.headerCharWrap}>
            <OrangeHeaderCharacter imageSize={130} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollBg}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollInner}>
          <View style={styles.levelCard}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={[styles.levelBadge, { backgroundColor: COLORS.primary }]}
              >
                <Text style={styles.levelBadgeText}>Lv.{level}</Text>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.levelName}>{info.name}</Text>
                <Text style={styles.levelDesc}>
                  {info.desc} · {words.length}개 단어
                </Text>
                {info.topics ? (
                  <Text style={styles.levelTopics} numberOfLines={2}>
                    {info.topics}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeLevelBtn}
              onPress={onChangeLevel}
            >
              <Text style={styles.changeLevelText}>변경</Text>
            </TouchableOpacity>
          </View>

          {/* 단어장 & 오답노트 버튼 */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onWordList}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionLabel}>단어장</Text>
              <Text style={styles.actionCount}>{words.length}개</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                wrongCount > 0 && styles.actionBtnDanger,
              ]}
              onPress={onWrongNote || (() => {})}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>❌</Text>
              <Text style={styles.actionLabel}>오답노트</Text>
              <Text
                style={[
                  styles.actionCount,
                  wrongCount > 0 && { color: COLORS.danger },
                ]}
              >
                {wrongCount}개
              </Text>
            </TouchableOpacity>
          </View>

          {/* 게임 모드 선택 상자 - 2열 그리드 */}
          <Text style={styles.sectionTitle}>🎮 모드선택</Text>

          <View style={styles.modeGrid}>
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={styles.modeCard}
                onPress={() => onStart(mode.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <Text style={styles.modeName} numberOfLines={1}>
                  {mode.label}
                </Text>
                <Text style={styles.modeDesc} numberOfLines={2}>
                  {mode.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 광고 제거 구매 */}
          {onShop && (
            <TouchableOpacity style={styles.shopBtn} onPress={onShop} activeOpacity={0.7}>
              <Text style={styles.shopIcon}>🔇</Text>
              <Text style={styles.shopLabel}>광고 제거 구매</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const MAX_CONTENT_WIDTH = 480;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  backRow: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerInner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  backBtn: { fontSize: 17, fontFamily: FONT.regular, color: COLORS.white },
  topHeader: {
    width: "100%",
    paddingTop: 6,
    paddingBottom: 0,
    overflow: "hidden",
  },
  headerInnerRow: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingLeft: 20,
    minHeight: 110,
  },
  headerTextArea: {
    flex: 1,
    paddingBottom: 18,
  },
  headerTitleWhite: {
    fontSize: 22,
    fontFamily: FONT.bold,
    color: COLORS.white,
    lineHeight: 28,
  },
  headerSubWhite: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    lineHeight: 17,
  },
  headerCharWrap: {
    width: 120,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "visible",
    marginRight: 4,
    marginBottom: -30,
  },
  scrollBg: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  scroll: {
    paddingBottom: 40,
  },
  scrollInner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 16,
    marginTop: -8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    width: "100%",
    ...SHADOW.small,
  },
  levelBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadgeText: { fontSize: 14, fontFamily: FONT.bold, color: COLORS.white },
  levelName: { fontSize: 19, fontFamily: FONT.bold, color: COLORS.text },
  levelDesc: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  levelTopics: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.textLight,
    marginTop: 3,
    lineHeight: 16,
  },
  changeLevelBtn: {
    backgroundColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  changeLevelText: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.text,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  actionBtnDanger: { borderColor: "#fecaca" },
  actionIcon: { fontSize: 32, marginBottom: 6 },
  actionLabel: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.text },
  actionCount: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: COLORS.text,
    marginBottom: 14,
  },
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    width: "100%",
  },
  modeCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  modeIcon: { fontSize: 38, marginBottom: 10 },
  modeName: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: COLORS.text,
    textAlign: "center",
  },
  modeDesc: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    width: "100%",
    ...SHADOW.small,
  },
  shopIcon: { fontSize: 22 },
  shopLabel: { fontSize: 15, fontFamily: FONT.semiBold, color: COLORS.text },
});
