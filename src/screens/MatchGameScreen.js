// 카드 매칭 게임 - 짝 맞추기

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { FONT, COLORS, SHADOW } from '../utils/theme';
import { shuffle, speak, sfxTap, sfxMatch, sfxWrong, sfxRight, sfxDone, formatTime, capFirst } from '../utils/helpers';
import { WORDS_L1 } from '../data/words';
import { logGameComplete } from '../services/analytics';
import { checkAndRequestReview } from '../utils/storeReview';
import { useAds } from '../context/AdsContext';

const { width } = Dimensions.get('window');
const MAX_CONTENT_WIDTH = 480;
const P = 6;
const COLS = 3;
const GAP = 8;
const CARD_W = (Math.min(width, MAX_CONTENT_WIDTH) - 40 - GAP * (COLS - 1)) / COLS;

export default function MatchGameScreen({
  words, level, onBack, onNextLevel,
  wrongWords, attemptHistory, addWrongWord, removeWrongWord, recordAttempt,
}) {
  const { showInterstitial } = useAds();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const starAnim1 = useRef(new Animated.Value(0)).current;
  const starAnim2 = useRef(new Animated.Value(0)).current;
  const starAnim3 = useRef(new Animated.Value(0)).current;
  const didLogComplete = useRef(false);

  const generate = useCallback(() => {
    const pool = words.length >= 6 ? words : WORDS_L1;
    const sel = shuffle(pool).slice(0, P);
    const pairs = sel.flatMap((w, i) => [
      { id: `en-${i}`, pid: i, text: capFirst(w.en), type: 'en', word: w },
      { id: `ko-${i}`, pid: i, text: w.ko, type: 'ko', word: w },
    ]);
    setCards(shuffle(pairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setDone(false);
    setStartTime(Date.now());
    setElapsed(0);
    didLogComplete.current = false;
  }, [words]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    if (!startTime || done) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime, done]);

  useEffect(() => {
    if (!done || didLogComplete.current) return;
    didLogComplete.current = true;
    logGameComplete({ mode: 'match', level, score: P, total: P, timeSeconds: elapsed, extra: { moves } });
    checkAndRequestReview();
  }, [done, level, elapsed, moves]);

  const flip = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(cards[idx].pid)) return;
    sfxTap();
    speak(cards[idx].word.en);

    const nf = [...flipped, idx];
    setFlipped(nf);

    if (nf.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = nf;
      if (cards[a].pid === cards[b].pid) {
        // 매칭 성공
        setTimeout(sfxMatch, 200);
        const nm = [...matched, cards[a].pid];
        setMatched(nm);
        setFlipped([]);
        recordAttempt(cards[a].word, true);
        if (nm.length === P) {
          setDone(true);
          setTimeout(sfxRight, 300);
        }
      } else {
        // 매칭 실패
        setTimeout(sfxWrong, 200);
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  if (done) {
    const stars = moves <= P + 2 ? 3 : moves <= P + 5 ? 2 : 1;
    return (
      <View style={styles.outer}><View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={{ fontSize: 72 }}>{'⭐'.repeat(stars)}</Text>
          <Text style={styles.resultTitle}>매칭 완료!</Text>
          <Text style={styles.resultStat}>{moves}번 시도 · {formatTime(elapsed)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => { showInterstitial(); generate(); }}>
              <Text style={styles.btnText}>다시 하기</Text>
            </TouchableOpacity>
            {onNextLevel && (
              <TouchableOpacity style={styles.btnNext} onPress={onNextLevel}>
                <Text style={styles.btnText}>다음 레벨 →</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnSecondary} onPress={onBack}>
              <Text style={styles.btnSecText}>메뉴로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View></View>
    );
  }

  return (
    <View style={styles.outer}><View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Text style={styles.statText}>{moves}번</Text>
          <Text style={styles.statText}>⏱{elapsed}s</Text>
          <Text style={styles.statText}>{matched.length}/{P}쌍</Text>
        </View>
      </View>

      <Text style={styles.modeSubtitle}>카드를 뒤집어 같은 단어끼리 선택하세요.</Text>

      <View style={styles.progressSpacer} />

      <View style={styles.grid}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx);
          const isMatched = matched.includes(card.pid);
          const show = isFlipped || isMatched;

          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                show && styles.cardFlipped,
                isMatched && styles.cardMatched,
              ]}
              onPress={() => flip(idx)}
              disabled={show}
              activeOpacity={0.7}
            >
              {show ? (
                <View style={styles.cardInner}>
                  <Text style={[styles.cardText, card.type === 'en' && { fontFamily: FONT.bold }]}>
                    {card.text}
                  </Text>
                  <Text style={styles.cardType}>{card.type === 'en' ? '🇬🇧' : '🇰🇷'}</Text>
                </View>
              ) : (
                <Text style={styles.cardBack}>?</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 18,
  },
  progressSpacer: { paddingVertical: 8, marginBottom: 4 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { fontSize: 18, fontFamily: FONT.regular, color: COLORS.primary },
  statText: { fontSize: 15, fontFamily: FONT.regular, color: COLORS.textSecondary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: GAP,
    justifyContent: 'center',
    paddingTop: 16,
  },
  card: {
    width: CARD_W,
    height: CARD_W * 1.1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.small,
  },
  cardFlipped: { backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.primary },
  cardMatched: { backgroundColor: '#d1fae5', borderColor: COLORS.success, opacity: 0.8 },
  cardInner: { alignItems: 'center', padding: 4 },
  cardText: { fontSize: 16, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'center' },
  cardType: { fontSize: 14, fontFamily: FONT.semiBold, marginTop: 6 },
  cardBack: { fontSize: 30, fontFamily: FONT.bold, color: 'rgba(255,255,255,0.6)' },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultTitle: { fontSize: 30, fontFamily: FONT.extraBold, color: COLORS.text, marginTop: 8, marginBottom: 10 },
  resultStat: { fontSize: 18, fontFamily: FONT.semiBold, color: COLORS.textSecondary },
  btnPrimary: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  btnNext: { backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  btnText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.white },
  btnSecondary: { backgroundColor: '#f3f4f6', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  btnSecText: { fontSize: 18, fontFamily: FONT.bold, color: COLORS.textSecondary },
});
