// 레벨 선택 화면

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, COLORS, SHADOW, RADIUS } from "../utils/theme";

const CARD_GRAD_START = "#5A4ABD";
const CARD_GRAD_END = "#7B6BDF";
import { LEVEL_INFO, getAllWordsForLevel } from "../data/words";
import { GhostAnim, BounceAnim, SquirmAnim, BallBounceAnim, DriftAnim } from "../components/CharacterAnims";

const CHAR_SIZE = 60;
const CHAR_SIZE_MID = 72;
const CHAR_SIZE_SM = 51;
const CHAR_SIZE_4TH = Math.round(CHAR_SIZE_SM * 0.7); // 4번째 0.7배

export default function LevelSelectScreen({
  onSelect,
  currentLevel,
  onBack,
  attemptHistory,
}) {
  const levels = LEVEL_INFO.map((l) => ({
    ...l,
    actual: getAllWordsForLevel(l.level).length,
    studied: getAllWordsForLevel(l.level).filter((w) => attemptHistory[w.en])
      .length,
  }));

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← 뒤로</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBg}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollInner}>
        <View style={styles.characterRow}>
          <GhostAnim style={styles.charSlot1}>
            <Image source={require("../../assets/skin_ghost.png")} style={styles.charImg} resizeMode="contain" />
          </GhostAnim>
          <BounceAnim style={styles.charSlot2}>
            <Image source={require("../../assets/full.png")} style={styles.charImg} resizeMode="contain" />
          </BounceAnim>
          <SquirmAnim style={styles.charSlot3}>
            <Image source={require("../../assets/skin_orange.png")} style={styles.charImgOrange} resizeMode="contain" />
          </SquirmAnim>
          <BallBounceAnim style={styles.charSlot4}>
            <Image source={require("../../assets/happy.png")} style={styles.charImg4th} resizeMode="contain" />
          </BallBounceAnim>
          <DriftAnim style={styles.charSlot5}>
            <Image source={require("../../assets/skin_cloud.png")} style={styles.charImgSm} resizeMode="contain" />
          </DriftAnim>
        </View>

        <Text style={styles.title}>나에게 맞는 레벨을 골라봐요!</Text>
        <Text style={styles.subtitle}>쉬운 것부터 해볼까요?</Text>

        {levels.map((lv) => {
          const isCurrent = lv.level === currentLevel;
          const cardInner = (
            <>
              {isCurrent && (
                <View style={[styles.badge, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.badgeText}>현재</Text>
                </View>
              )}
              <View style={styles.row1}>
                <View style={[styles.levelPill, isCurrent && styles.levelPillOnSelected]}>
                  <Text style={styles.levelPillText}>Lv.{lv.level}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, isCurrent && styles.cardTitleOnSelected]} numberOfLines={1}>
                    {lv.name}
                  </Text>
                  <Text style={[styles.cardSubtitle, isCurrent && styles.cardSubtitleOnSelected]} numberOfLines={1}>
                    {lv.desc} · {lv.actual}개 단어
                  </Text>
                </View>
                <Text style={[styles.cardCount, isCurrent && styles.cardCountOnSelected]}>{lv.actual}개</Text>
              </View>
            </>
          );

          if (isCurrent) {
            return (
              <TouchableOpacity key={lv.level} onPress={() => onSelect(lv.level)} activeOpacity={0.7}>
                <LinearGradient
                  colors={[CARD_GRAD_START, CARD_GRAD_END]}
                  start={[0, 0.5]}
                  end={[1, 0.5]}
                  style={[styles.card, styles.cardSelected]}
                >
                  {cardInner}
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={lv.level}
              style={styles.card}
              onPress={() => onSelect(lv.level)}
              activeOpacity={0.7}
            >
              {cardInner}
            </TouchableOpacity>
          );
        })}
        </View>
      </ScrollView>
    </View>
  );
}

const MAX_CONTENT_WIDTH = 480;

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    width: "100%",
    paddingVertical: 14,
  },
  headerInner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  backBtn: { fontSize: 17, fontFamily: FONT.regular, color: COLORS.textSecondary },
  characterRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
    height: CHAR_SIZE_MID + 50,
  },
  charSlot1: { marginRight: 4, marginBottom: 0 },
  charSlot2: { marginRight: 4, marginBottom: 0 },
  charSlot3: { marginBottom: 0 },
  charSlot4: { marginLeft: 4, marginBottom: 0 },
  charSlot5: { marginLeft: 6, marginBottom: 40 },
  charImg: { width: CHAR_SIZE, height: CHAR_SIZE },
  charImgOrange: { width: CHAR_SIZE_MID, height: CHAR_SIZE_MID },
  charImgSm: { width: CHAR_SIZE_SM, height: CHAR_SIZE_SM },
  charImg4th: { width: CHAR_SIZE_4TH, height: CHAR_SIZE_4TH },
  title: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  scrollBg: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    paddingBottom: 40,
  },
  scrollInner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    ...SHADOW.small,
  },
  cardSelected: {
    borderWidth: 0,
    borderColor: "transparent",
  },
  levelPillOnSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontFamily: FONT.bold, color: COLORS.white },
  row1: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  levelPillText: {
    fontSize: 15,
    fontFamily: FONT.bold,
    color: COLORS.white,
  },
  cardTitleOnSelected: { color: COLORS.white },
  cardSubtitleOnSelected: { color: "rgba(255,255,255,0.9)" },
  cardCountOnSelected: { color: "rgba(255,255,255,0.9)" },
  cardInfo: { flex: 1, marginLeft: 12, minWidth: 0 },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardCount: {
    fontSize: 15,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});
