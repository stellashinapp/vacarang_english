// 유틸리티 함수들

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// 로컬 효과음 파일
const SFX_CORRECT = require('../../assets/sounds/correct.mp3');
const SFX_WRONG = require('../../assets/sounds/wrong.wav');
const SFX_RIGHT = require('../../assets/sounds/right.mp3');
const SFX_LOGO = require('../../assets/sounds/logo_sound.wav');

let sfxPlaying = false;

async function playSfx(source) {
  if (sfxPlaying) return;
  sfxPlaying = true;
  let sound = null;
  try {
    const { sound: s } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume: 0.5,
    });
    sound = s;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sfxPlaying = false;
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (e) {
    sfxPlaying = false;
    console.warn('SFX play failed:', e);
  }
}

// 영어 단어 표시: 첫 글자만 대문자 (Apple, Banana)
export function capFirst(s) {
  if (!s || typeof s !== 'string') return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// 배열 셔플
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// TTS 발음 재생
export function speak(word, lang = 'en-US') {
  Speech.speak(word, {
    language: lang,
    rate: 0.85,
    pitch: 1.0,
  });
}

// 효과음 (햅틱 + 맞는 소리)
export async function sfxCorrect() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
  playSfx(SFX_CORRECT);
}

// 효과음 (햅틱 + 틀리는 소리)
export async function sfxWrong() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) {}
  playSfx(SFX_WRONG);
}

export async function sfxTap() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {}
}

export async function sfxMatch() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {}
}

// 인트로 로고 나올 때 재생
export async function playLogoSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(SFX_LOGO, {
      shouldPlay: true,
      volume: 0.7,
    });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (e) {
    console.warn('playLogoSound failed:', e);
  }
}

// 결과 화면 효과음 (점수 나올 때) - sfxPlaying과 무관하게 항상 재생
export async function sfxRight() {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
  try {
    const { sound } = await Audio.Sound.createAsync(SFX_RIGHT, {
      shouldPlay: true,
      volume: 0.7,
    });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (e) {
    console.warn('sfxRight failed:', e);
  }
}

export async function sfxDone() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
  } catch (e) {}
}

// 시간 포맷
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

// 성적 등급
export function getGrade(percent) {
  if (percent >= 90) return { emoji: '🏆', text: '완벽해요!', color: '#f59e0b' };
  if (percent >= 70) return { emoji: '🎉', text: '훌륭해요!', color: '#10b981' };
  if (percent >= 50) return { emoji: '👍', text: '잘했어요!', color: '#3b82f6' };
  return { emoji: '💪', text: '더 노력해봐요!', color: '#8b5cf6' };
}
