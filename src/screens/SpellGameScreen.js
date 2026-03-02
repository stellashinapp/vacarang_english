// 스펠링 게임 - 철자 입력
// 2-스트라이크: 1번 틀림 → 다시 시도, 2번 틀림 → 정답 공개

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Keyboard,
} from "react-native";
import { FONT, COLORS, SHADOW } from "../utils/theme";
import {
  shuffle,
  speak,
  sfxCorrect,
  sfxWrong,
  sfxRight,
  sfxDone,
  formatTime,
  getGrade,
  capFirst,
} from "../utils/helpers";
import { WORDS_L1 } from "../data/words";

const N = 10;
const MAX_CONTENT_WIDTH = 480;

export default function SpellGameScreen({
  words,
  level,
  onBack,
  wrongWords,
  attemptHistory,
  addWrongWord,
  removeWrongWord,
  recordAttempt,
}) {
  const [ws, setWs] = useState([]);
  const [cur, setCur] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [res, setRes] = useState(null); // null | 'correct' | 'wrong'
  const [strike, setStrike] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const [wrongList, setWrongList] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const inputRef = useRef(null);

  const generate = useCallback(() => {
    const pool = words.length >= 4 ? words : WORDS_L1;
    setWs(shuffle(pool).slice(0, N));
    setCur(0);
    setInput("");
    setScore(0);
    setRes(null);
    setStrike(0);
    setDone(false);
    setShowHint(false);
    setWrongList([]);
    setStartTime(Date.now());
  }, [words]);

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    if (ws.length > 0 && !done) {
      setTimeout(() => speak(ws[cur].en), 300);
    }
  }, [cur, ws, done]);

  const submit = () => {
    if (!input.trim() || res !== null) return;
    const w = ws[cur];
    const ok = input.trim().toLowerCase() === w.en.toLowerCase();

    if (ok) {
      setRes("correct");
      sfxCorrect();
      speak(w.en);
      setScore((s) => s + 1);
      recordAttempt(w, true);
      removeWrongWord(w);
      setTimeout(goNext, 1500);
    } else if (strike === 0) {
      setStrike(1);
      sfxWrong();
      setInput("");
      setShowHint(true);
    } else {
      setRes("wrong");
      sfxWrong();
      recordAttempt(w, false);
      addWrongWord(w);
      setWrongList((prev) => [...prev, w]);
      setTimeout(goNext, 2500);
    }
  };

  const goNext = () => {
    if (cur + 1 >= N) {
      setDone(true);
      sfxRight();
      Keyboard.dismiss();
    } else {
      setCur((c) => c + 1);
      setInput("");
      setRes(null);
      setStrike(0);
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  if (ws.length === 0) return null;

  if (done) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const percent = Math.round((score / N) * 100);
    const grade = getGrade(percent);
    return (
      <View style={styles.outer}><View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={{ fontSize: 72 }}>{grade.emoji}</Text>
          <Text style={styles.resultTitle}>{grade.text}</Text>
          <Text style={styles.resultStat}>
            {score}/{N} 정답 · {percent}% · {formatTime(elapsed)}
          </Text>
          {wrongList.length > 0 && (
            <View style={styles.wrongBox}>
              <Text style={styles.wrongTitle}>❌ 틀린 단어</Text>
              {wrongList.map((w, i) => (
                <Text key={i} style={styles.wrongItem}>
                  {capFirst(w.en)} = {w.ko}
                </Text>
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={styles.btnPrimary} onPress={generate}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={onBack}>
              <Text style={styles.btnSecText}>메뉴로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View></View>
    );
  }

  const w = ws[cur];
  const hint = w.en.charAt(0) + w.en.slice(1).replace(/[a-z]/gi, " _ ");

  return (
    <View style={styles.outer}><View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>
          ⭐ {score} | {cur + 1}/{N}
        </Text>
      </View>

      <Text style={styles.modeSubtitle}>스펠링을 입력해보세요</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${((cur + 1) / N) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressCounter}>{cur + 1} / {N}</Text>
      </View>

      {/* 문제 */}
      <View style={styles.questionArea}>
        <Text style={styles.questionKo}>{w.ko}</Text>
        {w.emoji && <Text style={styles.questionEmoji}>{w.emoji}</Text>}
        <TouchableOpacity onPress={() => speak(w.en)} style={styles.speakBtn}>
          <Text style={{ fontSize: 32 }}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* 힌트 */}
      {showHint && (
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>💡 힌트</Text>
          <Text style={styles.hintText}>{hint}</Text>
          <Text style={styles.hintLen}>{w.en.length}글자</Text>
        </View>
      )}

      {/* 입력 */}
      <View style={styles.inputArea}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            res === "correct" && styles.inputCorrect,
            res === "wrong" && styles.inputWrong,
          ]}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={submit}
          placeholder="영어 단어를 입력하세요"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="none"
          autoCorrect={false}
          editable={res === null}
        />
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!input.trim() || res !== null) && styles.submitBtnDisabled,
          ]}
          onPress={submit}
          disabled={!input.trim() || res !== null}
        >
          <Text style={styles.submitText}>확인</Text>
        </TouchableOpacity>
      </View>

      {/* 결과 */}
      {res === "wrong" && (
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>
            정답: <Text style={{ fontFamily: FONT.bold }}>{capFirst(w.en)}</Text>
          </Text>
        </View>
      )}
      {res === "correct" && (
        <View
          style={[
            styles.answerBox,
            { backgroundColor: "#d1fae5", borderColor: "#a7f3d0" },
          ]}
        >
          <Text style={[styles.answerText, { color: "#065f46" }]}>
            ✓ 정답! {capFirst(w.en)}
          </Text>
        </View>
      )}
    </View></View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  modeSubtitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.text,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
  },
  progressSection: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressCounter: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { fontSize: 18, fontFamily: FONT.regular, color: COLORS.primary },
  scoreText: { fontSize: 16, fontFamily: FONT.regular, color: COLORS.text },
  progressBar: {
    height: 5,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  questionArea: { alignItems: "center", paddingVertical: 36 },
  questionKo: { fontSize: 30, fontFamily: FONT.extraBold, color: COLORS.text },
  questionEmoji: { fontSize: 50, marginTop: 10 },
  speakBtn: { marginTop: 14, padding: 8 },
  hintBox: {
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  hintLabel: { fontSize: 14, fontFamily: FONT.bold, color: "#92400e" },
  hintText: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: COLORS.text,
    letterSpacing: 3,
    marginTop: 6,
  },
  hintLen: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: "#92400e",
    marginTop: 4,
  },
  inputArea: { flexDirection: "row", paddingHorizontal: 20, gap: 12 },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 20,
    fontFamily: FONT.bold,
    borderWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  inputCorrect: { borderColor: COLORS.success, backgroundColor: "#d1fae5" },
  inputWrong: { borderColor: COLORS.danger, backgroundColor: "#fee2e2" },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: "#d1d5db" },
  submitText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.white },
  answerBox: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  answerText: { fontSize: 18, fontFamily: FONT.semiBold, color: "#1e40af" },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  resultTitle: {
    fontSize: 30,
    fontFamily: FONT.extraBold,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 16,
  },
  resultStat: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
  },
  wrongBox: {
    width: "100%",
    backgroundColor: "#fff1f2",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  wrongTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: COLORS.danger,
    marginBottom: 10,
  },
  wrongItem: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.text,
    paddingVertical: 4,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  btnText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.white },
  btnSecondary: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  btnSecText: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: COLORS.textSecondary,
  },
});
