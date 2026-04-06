// 단어장 화면 - 전 레벨 단어 리스트
// 기능: 전체보기/오답만보기, 시도횟수 표시, TTS 발음, 검색

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONT, COLORS, SHADOW, RADIUS } from "../utils/theme";
import { speak, capFirst } from "../utils/helpers";
import { logWordListEnter } from "../services/analytics";

const STUDY_KEY = (lv) => `studyProgress_Lv${lv}`;
const MAX_CONTENT_WIDTH = 480;

export default function WordListScreen({
  level,
  words,
  wrongWords,
  attemptHistory,
  onBack,
  onHome,
  mode = "wordlist",
}) {
  const insets = useSafeAreaInsets();
  const isWrongNote = mode === "wrongnote";
  const [filter, setFilter] = useState(isWrongNote ? "wrong" : "all");
  const [studyProgress, setStudyProgress] = useState({});

  useEffect(() => {
    logWordListEnter(mode);
  }, [mode]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STUDY_KEY(level));
        if (raw) setStudyProgress(JSON.parse(raw));
      } catch (e) {}
    })();
  }, [level]);

  const toggleStudy = useCallback(
    (w) => {
      setStudyProgress((prev) => {
        const cur = prev[w.en] || { checked: false, count: 0 };
        const next = {
          ...prev,
          [w.en]: { checked: !cur.checked, count: cur.count + 1 },
        };
        AsyncStorage.setItem(STUDY_KEY(level), JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [level]
  );
  const [search, setSearch] = useState("");
  // 필터링된 단어 리스트
  const filteredWords = useMemo(() => {
    let list = [...words];

    // 필터 적용
    if (filter === "wrong") {
      list = list.filter((w) => wrongWords[w.en]);
    } else if (filter === "unattempted") {
      list = list.filter((w) => !attemptHistory[w.en]);
    }

    // 검색 적용
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) => w.en.toLowerCase().includes(q) || w.ko.includes(q),
      );
    }

    return list;
  }, [words, filter, search, wrongWords, attemptHistory]);

  // 통계
  const totalWords = words.length;
  const studiedWords = words.filter((w) => attemptHistory[w.en]).length;
  const wrongCount = Object.keys(wrongWords).filter((en) =>
    words.some((w) => w.en === en),
  ).length;

  const renderWord = ({ item: w, index }) => {
    const attempts = attemptHistory[w.en];
    const isWrong = !!wrongWords[w.en];
    const study = studyProgress[w.en] || { checked: false, count: 0 };

    return (
      <TouchableOpacity
        style={[styles.wordCard, isWrong && styles.wordCardWrong]}
        onPress={() => {
          speak(w.en);
          toggleStudy(w);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.wordRow}>
          <Text style={styles.wordIndex}>{index + 1}</Text>
          {study.checked ? (
            <Text style={styles.studyCheck}>✓</Text>
          ) : (
            <View style={styles.studyCheckPlaceholder} />
          )}
          {w.emoji ? (
            <Text style={styles.wordEmoji}>{w.emoji}</Text>
          ) : (
            <View style={styles.wordEmojiPlaceholder} />
          )}

          <View style={styles.wordInfo}>
            <Text style={styles.wordEn}>{capFirst(w.en)}</Text>
            <Text style={styles.wordKo}>{w.ko}</Text>
          </View>

          {study.count > 0 && (
            <View style={styles.studyCountBadge}>
              <Text style={styles.studyCountText}>{study.count}회</Text>
            </View>
          )}
          {attempts && (
            <View
              style={[
                styles.attemptBadge,
                {
                  backgroundColor: attempts.correct > 0 ? "#d1fae5" : "#fee2e2",
                },
              ]}
            >
              <Text
                style={[
                  styles.attemptText,
                  { color: attempts.correct > 0 ? "#065f46" : "#991b1b" },
                ]}
              >
                {attempts.attempts}회
              </Text>
            </View>
          )}

          {isWrong && <Text style={styles.wrongMark}>❌</Text>}

          <TouchableOpacity onPress={() => speak(w.en)} style={styles.speakBtn}>
            <Text style={{ fontSize: 20 }}>🔊</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const paddingTop = Math.max(insets.top, 12);

  return (
    <SafeAreaView style={styles.outer} edges={["left", "right", "bottom"]}>
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerNavRow, { paddingTop }]}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← 뒤로</Text>
          </TouchableOpacity>
          {onHome ? (
            <TouchableOpacity onPress={onHome}>
              <Text style={styles.backBtn}>메인</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </View>
        <Text style={styles.headerTitle}>
          {isWrongNote ? `Lv.${level} 오답노트` : `Lv.${level} 단어장`}
        </Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalWords}</Text>
          <Text style={styles.statLabel}>전체</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.success }]}>
            {studiedWords}
          </Text>
          <Text style={styles.statLabel}>학습</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.danger }]}>
            {wrongCount}
          </Text>
          <Text style={styles.statLabel}>오답</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.textLight }]}>
            {totalWords - studiedWords}
          </Text>
          <Text style={styles.statLabel}>미학습</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 단어 검색..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {!isWrongNote && (
      <View style={styles.filterRow}>
        {[
          { key: "all", label: `전체 (${totalWords})` },
          { key: "wrong", label: `오답 (${wrongCount})` },
          {
            key: "unattempted",
            label: `미학습 (${totalWords - studiedWords})`,
          },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              filter === f.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      )}

      <FlatList
        data={filteredWords}
        renderItem={renderWord}
        keyExtractor={(item) => item.en}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>
              {filter === "wrong" ? "오답이 없습니다!" : "결과가 없습니다"}
            </Text>
          </View>
        }
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
  },
  backBtn: { fontSize: 18, fontFamily: FONT.regular, color: COLORS.primary },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.text, marginTop: 2, marginBottom: 8 },

  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    paddingVertical: 14,
    ...SHADOW.small,
  },
  statItem: { alignItems: "center" },
  statNum: { fontSize: 20, fontFamily: FONT.bold, color: COLORS.primary },
  statLabel: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  searchBar: { paddingHorizontal: 16, marginTop: 16 },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: FONT.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS,
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
  },
  filterTextActive: { color: COLORS.white },

  listContent: { padding: 16, paddingBottom: 40 },

  wordCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wordCardWrong: { borderColor: "#fecaca", backgroundColor: "#fffbeb" },
  wordRow: { flexDirection: "row", alignItems: "center" },
  wordIndex: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.textLight,
    width: 28,
  },
  studyCheck: { fontSize: 18, color: COLORS.primary, marginRight: 6, fontWeight: "800" },
  studyCheckPlaceholder: { width: 20, marginRight: 6 },
  studyCountBadge: {
    backgroundColor: "#ede9fe",
    borderRadius: RADIUS,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  studyCountText: { fontSize: 11, fontFamily: FONT.semiBold, color: COLORS.primary },
  wordEmoji: { fontSize: 24, marginRight: 10 },
  wordEmojiPlaceholder: { width: 34 },
  wordInfo: { flex: 1 },
  wordEn: { fontSize: 18, fontFamily: FONT.extraBold, color: COLORS.text },
  wordKo: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  attemptBadge: {
    borderRadius: RADIUS,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  attemptText: { fontSize: 11, fontFamily: FONT.semiBold },
  wrongMark: { fontSize: 14, marginRight: 8 },
  speakBtn: { padding: 4 },

  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
  },
});
