// Oxford 3000 Word Data - 3,000+ words across 10 levels
// 각 레벨 데이터는 별도 파일에서 로드

const LEVEL_INFO = [
  { level: 1, name: "입문", desc: "A1 최기초 단어", color: "#10b981", count: 251,
    topics: "인사, 숫자, 가족, 신체, 음식, 동물, 색깔, 기본동사/형용사" },
  { level: 2, name: "초급", desc: "A1-A2 일상 단어", color: "#3b82f6", count: 446,
    topics: "일상, 감정, 쇼핑, 교통, 직업, 건강, 날씨, 취미" },
  { level: 3, name: "초중급", desc: "A2 생활 필수", color: "#8b5cf6", count: 330,
    topics: "사회, 교육, 비즈니스, 미디어, 환경, 여행, 문화" },
  { level: 4, name: "중급 A", desc: "A2-B1 표현 확장", color: "#f59e0b", count: 429,
    topics: "정치, 법률, 경제, 과학, 기술, 의료, 추상개념" },
  { level: 5, name: "중급 B", desc: "B1 실용 단어", color: "#ef4444", count: 288,
    topics: "직업, 사회문제, 예술, 종교, 스포츠, 범죄, 정치" },
  { level: 6, name: "중상급", desc: "B1 후반 어휘", color: "#ec4899", count: 363,
    topics: "경제, 관계, 감정, 자연, 건축, 의학, 미디어" },
  { level: 7, name: "고급 A", desc: "B1-B2 심화", color: "#6366f1", count: 217,
    topics: "추상, 형용사, 부사, 관용표현, 동사 확장" },
  { level: 8, name: "고급 B", desc: "B2 학술 어휘", color: "#8b5cf6", count: 251,
    topics: "학술, 정치, 법률, 경제, 과학, 철학, 논리" },
  { level: 9, name: "고급 C", desc: "B2 전문 어휘", color: "#dc2626", count: 255,
    topics: "외교, 금융, 법학, 행정, 언론, 전략" },
  { level: 10, name: "마스터", desc: "B2 최고급", color: "#1e293b", count: 223,
    topics: "고급 학술, 정치, 사회, 철학, 문학, 전문용어" },
];

// ═══ 레벨별 데이터 로드 ═══

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

// ═══ Game Logic ═══

export function getAllWordsForLevel(level) {
  const base = [[], WORDS_L1, WORDS_L2, WORDS_L3, WORDS_L4, WORDS_L5, WORDS_L6, WORDS_L7, WORDS_L8, WORDS_L9, WORDS_L10];
  return [...(base[level] || [])];
}

export { LEVEL_INFO, WORDS_L1, WORDS_L2, WORDS_L3, WORDS_L4, WORDS_L5, WORDS_L6, WORDS_L7, WORDS_L8, WORDS_L9, WORDS_L10 };
