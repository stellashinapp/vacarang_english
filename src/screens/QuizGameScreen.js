// 퀴즈 게임 (이모지/한→영/영→한)
// ★ 핵심 기능: 2-스트라이크 시스템
//   1번 틀림 → "다시 한번 생각해봐!" + 재도전 기회
//   2번 틀림 → 정답 표시 + 오답노트 기록

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { FONT, COLORS, SHADOW } from '../utils/theme';
import { shuffle, speak, sfxCorrect, sfxWrong, sfxRight, sfxDone, formatTime, getGrade, capFirst } from '../utils/helpers';
import { WORDS_L1 } from '../data/words';
import { logGameComplete } from '../services/analytics';
import { checkAndRequestReview } from '../utils/storeReview';
import { useAds } from '../context/AdsContext';

const MAX_CONTENT_WIDTH = 480;
const N = 10;

export default function QuizGameScreen({
  mode, words, level, onBack, onGameEnd, onNextLevel,
  wrongWords, attemptHistory, addWrongWord, removeWrongWord, recordAttempt,
}) {
  const { showInterstitial } = useAds();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [strike, setStrike] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const didLogComplete = useRef(false);
  const [wrongList, setWrongList] = useState([]); // 이번 게임에서 틀린 단어
  const [totalAttempts, setTotalAttempts] = useState(0);

  // 애니메이션
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (done) {
      star1.setValue(0);
      star2.setValue(0);
      star3.setValue(0);
      const percent = Math.round((score / N) * 100);
      const starCount = percent >= 90 ? 3 : percent >= 60 ? 2 : 1;
      const anims = [
        Animated.spring(star1, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ];
      if (starCount >= 2) anims.push(Animated.spring(star2, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }));
      if (starCount >= 3) anims.push(Animated.spring(star3, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }));
      Animated.stagger(350, anims).start();
    }
  }, [done]);

  // 게임 생성
  const generateQuestions = useCallback(() => {
    const pool = words.length >= 4 ? words : WORDS_L1;
    const selected = shuffle(pool).slice(0, N);
    const qs = selected.map(word => {
      const others = shuffle(pool.filter(w => w.en !== word.en)).slice(0, 3);

      if (mode === 'en2ko') {
        // 일본어 보고 한국어 맞추기
        const opts = shuffle([word, ...others]);
        return {
          word,
          display: word.jp || capFirst(word.en),
          reading: word.reading || '',
          options: opts.map(o => ({ en: o.en, ko: o.ko, label: o.ko })),
          correctIndex: opts.indexOf(word),
        };
      } else {
        // 이모지/한국어 보고 일본어 맞추기
        const display = mode === 'emoji' ? word.emoji : word.ko;
        const opts = shuffle([word, ...others]);
        return {
          word,
          display,
          options: opts.map(o => ({ en: o.en, ko: o.ko, jp: o.jp, reading: o.reading, label: o.jp || capFirst(o.en) })),
          correctIndex: opts.indexOf(word),
        };
      }
    });

    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setStrike(0);
    setDone(false);
    setStreak(0);
    setBestStreak(0);
    setStartTime(Date.now());
    setWrongList([]);
    setTotalAttempts(0);
    didLogComplete.current = false;
  }, [words, mode]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  // 흔들기 애니메이션
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // 답 선택 (기회 2번: 1번 틀리면 다시 시도, 2번 틀리면 정답 표시)
  const pickAnswer = (idx) => {
    if (showResult) return;

    const q = questions[current];
    const isCorrect = idx === q.correctIndex;
    setTotalAttempts(prev => prev + 1);

    if (isCorrect) {
      setSelected(idx);
      setShowResult(true);
      sfxCorrect();
      speak(q.word.en);
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      recordAttempt(q.word, true);
      removeWrongWord(q.word);
      setTimeout(goNext, 1500);
    } else if (strike === 0) {
      setStrike(1);
      triggerShake();
      sfxWrong();
      setSelected(null);
    } else {
      setSelected(idx);
      setShowResult(true);
      sfxWrong();
      triggerShake();
      setStreak(0);
      recordAttempt(q.word, false);
      addWrongWord(q.word);
      setWrongList(prev => [...prev, q.word]);
      setTimeout(goNext, 2500);
    }
  };

  // 문제가 바뀔 때 단어 자동 발음
  useEffect(() => {
    if (questions.length > 0 && !done) {
      speak(questions[current].word.en);
    }
  }, [current, questions, done]);

  // 다음 문제로
  const goNext = () => {
    if (current + 1 >= N) {
      setDone(true);
      sfxRight();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
      setStrike(0);
    }
  };

  // 게임 완료 시 한 번만 로그
  useEffect(() => {
    if (!done || didLogComplete.current || questions.length === 0) return;
    didLogComplete.current = true;
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    logGameComplete({ mode, level, score, total: questions.length, timeSeconds: elapsed });
    checkAndRequestReview();
  }, [done, mode, level, score, startTime, questions.length]);

  // 로딩 중
  if (questions.length === 0) return null;

  // 게임 완료
  if (done) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const percent = Math.round((score / N) * 100);
    const grade = getGrade(percent);

    return (
      <View style={styles.outer}>
        <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{grade.emoji}</Text>
          <Text style={styles.resultTitle}>{grade.text}</Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatNum}>{score}/{N}</Text>
              <Text style={styles.resultStatLabel}>정답</Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatNum}>{percent}%</Text>
              <Text style={styles.resultStatLabel}>정답률</Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatNum}>{formatTime(elapsed)}</Text>
              <Text style={styles.resultStatLabel}>소요시간</Text>
            </View>
          </View>

          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatNum}>{bestStreak}</Text>
              <Text style={styles.resultStatLabel}>최고 연속</Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatNum}>{totalAttempts}</Text>
              <Text style={styles.resultStatLabel}>총 시도</Text>
            </View>
            <View style={styles.resultStatItem}>
              <Text style={[styles.resultStatNum, wrongList.length > 0 && { color: COLORS.danger }]}>
                {wrongList.length}
              </Text>
              <Text style={styles.resultStatLabel}>오답</Text>
            </View>
          </View>

          {/* 오답 단어 리스트 */}
          {wrongList.length > 0 && (
            <View style={styles.wrongSection}>
              <Text style={styles.wrongTitle}>❌ 틀린 단어</Text>
              {wrongList.map((w, i) => (
                <View key={i} style={styles.wrongItem}>
                  <Text style={styles.wrongEn}>{capFirst(w.en)}</Text>
                  <Text style={styles.wrongKo}>{w.ko}</Text>
                  {w.emoji && <Text style={styles.wrongEmoji}>{w.emoji}</Text>}
                </View>
              ))}
            </View>
          )}

          <View style={styles.resultBtnRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => { showInterstitial(level); generateQuestions(); }}>
              <Text style={styles.btnPrimaryText}>다시 하기</Text>
            </TouchableOpacity>
            {onNextLevel && (
              <TouchableOpacity style={styles.btnNext} onPress={onNextLevel}>
                <Text style={styles.btnNextText}>다음 레벨 →</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnSecondary} onPress={onBack}>
              <Text style={styles.btnSecondaryText}>메뉴로</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </View>
    );
  }

  // 현재 문제
  const q = questions[current];
  const isEn = mode === 'en2ko';

  const modeSubtitle = {
    emoji: '이미지를 보고 맞춰보세요!',
    ko2en: '한국어를 보고 일본어를 찾아주세요.',
    en2ko: '일본어를 보고 뜻을 찾아주세요.',
  }[mode] || '';

  return (
    <View style={styles.outer}>
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={styles.scoreArea}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
          {streak >= 2 && <Text style={styles.streakText}>🔥{streak}</Text>}
        </View>
      </View>

      {/* 메인 부제 (중앙) */}
      {modeSubtitle ? (
        <Text style={styles.modeSubtitle}>{modeSubtitle}</Text>
      ) : null}

      {/* 진행 상태 영역 (간격 확보) */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((current + 1) / N) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{current + 1} / {N}</Text>
      </View>

      {/* 문제 표시 (한글/이모지/영어 중앙 정렬) */}
      <Animated.View style={[styles.questionArea, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.questionTextWrap}>
          <Text style={[
            styles.questionText,
            mode === 'emoji' && { fontSize: 74 },
            isEn && { fontFamily: FONT.bold },
          ]}>
            {q.display}
          </Text>
          {isEn && q.reading ? (
            <Text style={styles.furigana}>{q.reading}</Text>
          ) : null}
        </View>
        {mode === 'en2ko' && (
          <TouchableOpacity onPress={() => speak(q.word.en)} style={styles.speakBtn}>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
        )}
        {mode === 'emoji' && (
          <Text style={styles.emojiHint}>{q.word.ko}</Text>
        )}
      </Animated.View>

      {/* 보기 */}
      <View style={styles.optionsContainer}>
        {q.options.map((opt, i) => {
          let bg = COLORS.white;
          let borderColor = COLORS.border;
          let textColor = COLORS.text;

          if (showResult) {
            if (i === q.correctIndex) {
              bg = '#d1fae5';
              borderColor = COLORS.success;
              textColor = '#065f46';
            } else if (i === selected && selected !== q.correctIndex) {
              bg = '#fee2e2';
              borderColor = COLORS.danger;
              textColor = '#991b1b';
            }
          }

          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor }]}
              onPress={() => pickAnswer(i)}
              disabled={showResult}
              activeOpacity={0.7}
            >
              <View style={styles.optionLabelWrap}>
                <Text style={[styles.optionText, { color: textColor }]}>
                  {opt.label}
                </Text>
                {opt.reading ? (
                  <Text style={styles.optionFurigana}>{opt.reading}</Text>
                ) : null}
              </View>
              {showResult && i === q.correctIndex && (
                <Text style={styles.correctMark}>✓</Text>
              )}
              {showResult && i === selected && selected !== q.correctIndex && (
                <Text style={styles.wrongMark}>✗</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 정답 공개 시 상세 정보 */}
      {showResult && selected !== q.correctIndex && (
        <View style={styles.answerReveal}>
          <Text style={styles.answerRevealText}>
            정답: <Text style={styles.answerRevealBold}>{q.word.jp || capFirst(q.word.en)}</Text>
            {q.word.reading ? ` (${q.word.reading})` : ''} = {q.word.ko}
            {q.word.emoji ? ` ${q.word.emoji}` : ''}
          </Text>
        </View>
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  modeSubtitle: {
    alignSelf: 'stretch',
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
  },
  progressSection: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { fontSize: 18, fontFamily: FONT.regular, color: COLORS.primary },
  scoreArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreText: { fontSize: 18, fontFamily: FONT.regular, color: COLORS.warning },
  streakText: { fontSize: 16, fontFamily: FONT.regular, color: COLORS.danger },
  progressBar: {
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  // 다시 한번 생각해봐 배너
  thinkAgainBanner: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  thinkAgainText: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#92400e',
  },

  // 문제 영역 (한글/이모지/영어 중앙 정렬)
  questionArea: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    minHeight: 140,
  },
  questionTextWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    width: '100%',
    fontSize: 34,
    fontFamily: FONT.extraBold,
    color: COLORS.text,
    textAlign: 'center',
  },
  furigana: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  speakBtn: { marginTop: 10, padding: 8 },
  speakIcon: { fontSize: 30 },
  emojiHint: {
    width: '100%',
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  // 보기 버튼 (화면 중앙 정렬)
  optionsContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    ...SHADOW.small,
  },
  optionLabelWrap: {
    alignItems: 'center',
  },
  optionText: {
    fontSize: 19,
    fontFamily: FONT.bold,
    textAlign: 'center',
  },
  optionFurigana: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  correctMark: { fontSize: 20, color: COLORS.success, marginLeft: 8 },
  wrongMark: { fontSize: 20, color: COLORS.danger, marginLeft: 8 },

  // 정답 공개
  answerReveal: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  answerRevealText: { fontSize: 17, fontFamily: FONT.semiBold, color: '#1e40af' },
  answerRevealBold: { fontFamily: FONT.bold },

  // 결과 화면
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  resultEmoji: { fontSize: 74, marginBottom: 10 },
  resultTitle: { fontSize: 30, fontFamily: FONT.extraBold, color: COLORS.text, marginBottom: 24 },
  resultStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  resultStatItem: { alignItems: 'center' },
  resultStatNum: { fontSize: 24, fontFamily: FONT.bold, color: COLORS.primary },
  resultStatLabel: { fontSize: 14, fontFamily: FONT.semiBold, color: COLORS.textSecondary, marginTop: 4 },

  wrongSection: {
    width: '100%',
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 18,
  },
  wrongTitle: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.danger, marginBottom: 10 },
  wrongItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  wrongEn: { fontSize: 17, fontFamily: FONT.bold, color: COLORS.text },
  wrongKo: { fontSize: 16, fontFamily: FONT.semiBold, color: COLORS.textSecondary },
  wrongEmoji: { fontSize: 20 },

  resultBtnRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  btnPrimaryText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.white },
  btnSecondary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  btnSecondaryText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.textSecondary },
  btnNext: {
    backgroundColor: COLORS.success || '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  btnNextText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.white },
});
