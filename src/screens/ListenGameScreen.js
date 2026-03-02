// 듣기 퀴즈 게임 - 발음 듣고 맞추기
// 2-스트라이크 시스템 적용

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FONT, COLORS, SHADOW } from '../utils/theme';
import { shuffle, speak, sfxCorrect, sfxWrong, sfxRight, sfxDone, formatTime, getGrade, capFirst } from '../utils/helpers';
import { WORDS_L1 } from '../data/words';

const N = 10;
const MAX_CONTENT_WIDTH = 480;

export default function ListenGameScreen({
  words, level, onBack,
  wrongWords, attemptHistory, addWrongWord, removeWrongWord, recordAttempt,
}) {
  const [qs, setQs] = useState([]);
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);
  const [strike, setStrike] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongList, setWrongList] = useState([]);
  const starAnim1 = useRef(new Animated.Value(0)).current;
  const starAnim2 = useRef(new Animated.Value(0)).current;
  const starAnim3 = useRef(new Animated.Value(0)).current;
  const [startTime, setStartTime] = useState(null);

  const generate = useCallback(() => {
    const pool = words.length >= 4 ? words : WORDS_L1;
    const sh = shuffle(pool).slice(0, N).map(w => {
      const o = shuffle(pool.filter(x => x.en !== w.en)).slice(0, 3);
      const a = shuffle([w, ...o]);
      return { word: w, opts: a, ci: a.indexOf(w) };
    });
    setQs(sh);
    setCur(0);
    setScore(0);
    setSel(null);
    setShow(false);
    setStrike(0);
    setDone(false);
    setWrongList([]);
    setStartTime(Date.now());
  }, [words]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    if (qs.length > 0 && !done) {
      setTimeout(() => speak(qs[cur].word.en), 300);
    }
  }, [cur, qs, done]);

  const pick = (idx) => {
    if (show) return;
    speak(qs[cur].opts[idx].en);
    const ok = idx === qs[cur].ci;

    if (ok) {
      setSel(idx);
      setShow(true);
      sfxCorrect();
      setTimeout(() => speak(qs[cur].word.en), 1000);
      setScore(s => s + 1);
      recordAttempt(qs[cur].word, true);
      removeWrongWord(qs[cur].word);
      setTimeout(goNext, 2500);
    } else if (strike === 0) {
      setStrike(1);
      sfxWrong();
      setSel(null);
    } else {
      setSel(idx);
      setShow(true);
      sfxWrong();
      recordAttempt(qs[cur].word, false);
      addWrongWord(qs[cur].word);
      setWrongList(prev => [...prev, qs[cur].word]);
      setTimeout(goNext, 2500);
    }
  };

  const goNext = () => {
    if (cur + 1 >= N) { setDone(true); sfxDone(); }
    else { setCur(c => c + 1); setSel(null); setShow(false); setStrike(0); }
  };

  if (qs.length === 0) return null;

  if (done) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const percent = Math.round((score / N) * 100);
    const grade = getGrade(percent);
    return (
      <View style={styles.outer}><View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={{ fontSize: 72 }}>{grade.emoji}</Text>
          <Text style={styles.resultTitle}>{grade.text}</Text>
          <Text style={styles.resultStat}>{score}/{N} 정답 · {percent}% · {formatTime(elapsed)}</Text>
          {wrongList.length > 0 && (
            <View style={styles.wrongBox}>
              <Text style={styles.wrongTitle}>❌ 틀린 단어</Text>
              {wrongList.map((w, i) => (
                <Text key={i} style={styles.wrongItem}>{capFirst(w.en)} = {w.ko}</Text>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
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

  const q = qs[cur];
  return (
    <View style={styles.outer}><View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>⭐ {score}  |  {cur + 1}/{N}</Text>
      </View>

      <View style={styles.contentGap} />
      <Text style={styles.modeSubtitle}>발음을 듣고 맞춰보세요!</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((cur + 1) / N) * 100}%` }]} />
        </View>
        <Text style={styles.progressCounter}>{cur + 1} / {N}</Text>
      </View>

      {/* 스피커 버튼 */}
      <View style={styles.speakerArea}>
        <TouchableOpacity style={styles.speakerBtn} onPress={() => speak(q.word.en)}>
          <Text style={styles.speakerEmoji}>🔊</Text>
        </TouchableOpacity>
        <Text style={styles.speakerHint}>탭해서 다시 듣기</Text>
      </View>

      {/* 보기 */}
      <View style={styles.optsContainer}>
        {q.opts.map((opt, i) => {
          let bg = COLORS.white, border = COLORS.border, color = COLORS.text;
          if (show && i === q.ci) { bg = '#d1fae5'; border = COLORS.success; color = '#065f46'; }
          else if (show && i === sel) { bg = '#fee2e2'; border = COLORS.danger; color = '#991b1b'; }
          return (
            <TouchableOpacity key={i} style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => pick(i)} disabled={show} activeOpacity={0.7}>
              <Text style={[styles.optText, { color }]}>{capFirst(opt.en)}</Text>
              <Text style={styles.optKo}>{opt.ko}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {show && sel !== q.ci && (
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>정답: {capFirst(q.word.en)} = {q.word.ko}</Text>
        </View>
      )}
    </View></View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  contentGap: { height: 20 },
  modeSubtitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
  },
  progressSection: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { fontSize: 18, fontFamily: FONT.regular, color: COLORS.primary },
  scoreText: { fontSize: 16, fontFamily: FONT.regular, color: COLORS.text },
  progressBar: { height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressCounter: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  speakerArea: { alignItems: 'center', paddingVertical: 40 },
  speakerBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOW.medium },
  speakerEmoji: { fontSize: 50 },
  speakerHint: { fontSize: 15, fontFamily: FONT.semiBold, color: COLORS.textSecondary, marginTop: 14 },
  optsContainer: { paddingHorizontal: 20, gap: 12 },
  optBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, borderWidth: 1.5, ...SHADOW.small },
  optText: { fontSize: 19, fontFamily: FONT.bold },
  optKo: { fontSize: 15, fontFamily: FONT.semiBold, color: COLORS.textSecondary },
  answerBox: { marginTop: 18, marginHorizontal: 20, backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, alignItems: 'center' },
  answerText: { fontSize: 17, fontFamily: FONT.semiBold, color: '#1e40af' },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultTitle: { fontSize: 30, fontFamily: FONT.extraBold, color: COLORS.text, marginTop: 8, marginBottom: 16 },
  resultStat: { fontSize: 18, fontFamily: FONT.semiBold, color: COLORS.textSecondary },
  wrongBox: { width: '100%', backgroundColor: '#fff1f2', borderRadius: 14, padding: 16, marginTop: 16 },
  wrongTitle: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.danger, marginBottom: 10 },
  wrongItem: { fontSize: 16, fontFamily: FONT.semiBold, color: COLORS.text, paddingVertical: 4 },
  btnPrimary: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  btnText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.white },
  btnSecondary: { backgroundColor: '#f3f4f6', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  btnSecText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.textSecondary },
});
