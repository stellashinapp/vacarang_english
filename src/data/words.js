// Oxford 3000 Word Data - 3,000+ words across 10 levels
// 각 레벨 데이터는 별도 파일에서 로드

import { WORDS_L1 } from './oxford_l1';
import { WORDS_L2 } from './oxford_l2';
import { WORDS_L3 } from './oxford_l3';
import { WORDS_L4 } from './oxford_l4';
import { WORDS_L5 } from './oxford_l5';
import { WORDS_L6 } from './oxford_l6';
import { WORDS_L7 } from './oxford_l7';
import { WORDS_L8 } from './oxford_l8';
import { WORDS_L9 } from './oxford_l9';
import { WORDS_L10 } from './oxford_l10';

const LEVEL_INFO = [
  { level: 1, name: "입문", desc: "기초 중의 기초", color: "#10b981", count: 251 },
  { level: 2, name: "초급", desc: "일상 기본 단어", color: "#3b82f6", count: 446 },
  { level: 3, name: "초중급", desc: "생활 필수 단어", color: "#8b5cf6", count: 330 },
  { level: 4, name: "중급 A", desc: "표현력 확장", color: "#f59e0b", count: 429 },
  { level: 5, name: "중급 B", desc: "실용 단어", color: "#ef4444", count: 288 },
  { level: 6, name: "중상급", desc: "풍부한 어휘력", color: "#ec4899", count: 363 },
  { level: 7, name: "고급 A", desc: "심화 어휘", color: "#6366f1", count: 217 },
  { level: 8, name: "고급 B", desc: "학술 어휘", color: "#8b5cf6", count: 251 },
  { level: 9, name: "고급 C", desc: "전문 어휘", color: "#dc2626", count: 255 },
  { level: 10, name: "마스터", desc: "원어민 수준 도전", color: "#1e293b", count: 223 },
];

// ═══ Game Logic ═══

export function getAllWordsForLevel(level) {
  const base = [[], WORDS_L1, WORDS_L2, WORDS_L3, WORDS_L4, WORDS_L5, WORDS_L6, WORDS_L7, WORDS_L8, WORDS_L9, WORDS_L10];
  return [...(base[level] || [])];
}

export { LEVEL_INFO, WORDS_L1, WORDS_L2, WORDS_L3, WORDS_L4, WORDS_L5, WORDS_L6, WORDS_L7, WORDS_L8, WORDS_L9, WORDS_L10 };
