# 📚 Oxford Word Play - React Native

Oxford 3000 기반 영어 단어 학습 게임 앱 (1,715 단어 · 7레벨 · 6게임모드)

---

## 🆕 v1.0 새로운 기능

### ✅ 2-스트라이크 시스템
- 1번 틀림 → 상단에 **"🤔 다시 한번 생각해봐!"** 표시 + 재도전 기회
- 2번 틀림 → **정답 공개** + 오답노트 자동 기록

### ✅ 오답노트 & 단어장
- 틀린 문제는 자동으로 오답노트에 기록
- 정답 맞추면 오답노트에서 자동 제거
- 레벨별 전체 단어장 (검색/필터 지원)

### ✅ 시도 횟수 추적
- 각 단어별 시도 횟수 / 정답 횟수 기록
- 단어장에서 학습 이력 확인 가능
- 게임 중 해당 단어의 시도 이력 표시

### ✅ NotoSans 폰트 통일
- 전체 앱 NotoSans (Regular/Medium/SemiBold/Bold) 적용

---

## 📁 프로젝트 구조

```
oxford-word-play/
├── App.js                          # 메인 앱 (라우팅, 상태관리)
├── app.json                        # Expo 설정
├── eas.json                        # EAS Build 설정
├── package.json                    # 의존성
├── assets/
│   ├── fonts/                      # NotoSans 폰트 파일 (직접 추가 필요)
│   │   ├── NotoSans-Regular.ttf
│   │   ├── NotoSans-Medium.ttf
│   │   ├── NotoSans-SemiBold.ttf
│   │   └── NotoSans-Bold.ttf
│   ├── icon.png                    # 앱 아이콘 (1024x1024)
│   ├── splash.png                  # 스플래시 이미지 (1284x2778)
│   └── adaptive-icon.png           # 안드로이드 적응형 아이콘
└── src/
    ├── data/
    │   └── words.js                # 1,715개 단어 데이터 (7레벨)
    ├── utils/
    │   ├── theme.js                # 색상, 폰트, 그림자 상수
    │   └── helpers.js              # shuffle, TTS, 효과음, 유틸
    └── screens/
        ├── HomeScreen.js           # 시작 화면
        ├── LevelSelectScreen.js    # 레벨 선택 (학습 진행률 표시)
        ├── GameMenuScreen.js       # 게임 모드 선택 + 단어장/오답노트
        ├── QuizGameScreen.js       # ★ 퀴즈 게임 (이모지/한→영/영→한)
        ├── ListenGameScreen.js     # 듣기 게임
        ├── SpellGameScreen.js      # 스펠링 게임
        ├── MatchGameScreen.js      # 카드 매칭 게임
        ├── WordListScreen.js       # ★ 단어장 (전체/오답/미학습 필터)
        └── ResultScreen.js         # 결과 화면
```

---

## 🚀 시작하기

### 1. 프로젝트 초기화
```bash
# Expo 프로젝트 생성 (이미 있으면 생략)
npx create-expo-app oxford-word-play --template blank

# 이 프로젝트 파일을 복사
cp -r src/ App.js package.json app.json eas.json ./oxford-word-play/
```

### 2. 폰트 파일 추가
```bash
mkdir -p assets/fonts

# Google Fonts에서 NotoSans 다운로드
# https://fonts.google.com/noto/specimen/Noto+Sans
# Regular, Medium, SemiBold, Bold TTF 파일을 assets/fonts/에 복사
```

### 3. 의존성 설치
```bash
cd oxford-word-play
npm install

# 추가 패키지 설치
npx expo install expo-speech expo-av expo-haptics expo-font \
  @react-native-async-storage/async-storage \
  react-native-safe-area-context
```

### 4. 실행
```bash
npx expo start

# 안드로이드
npx expo start --android

# iOS
npx expo start --ios
```

---

## 📦 빌드 & 배포

### 안드로이드 APK (테스트용)
```bash
eas build -p android --profile preview
```

### 안드로이드 AAB (Play Store용)
```bash
eas build -p android --profile production
```

### iOS (App Store용)
```bash
eas build -p ios --profile production
```

### 스토어 제출
```bash
# Google Play
eas submit -p android

# App Store
eas submit -p ios
```

---

## 🎮 게임 모드 설명

| 모드 | 설명 | 2-스트라이크 |
|------|------|:---:|
| 🎯 이모지 퀴즈 | 이모지 보고 영어 맞추기 | ✅ |
| 🇰🇷 한→영 퀴즈 | 한국어 보고 영어 맞추기 | ✅ |
| 🇬🇧 영→한 퀴즈 | 영어 보고 한국어 맞추기 | ✅ |
| 👂 듣기 퀴즈 | 발음 듣고 단어 맞추기 | ✅ |
| ✏️ 스펠링 | 영어 철자 입력하기 | ✅ |
| 🃏 카드 매칭 | 영어-한국어 짝 맞추기 | - |

---

## 📊 데이터 저장 (AsyncStorage)

| 키 | 내용 |
|------|------|
| `wrongWords` | 오답 단어 기록 `{ "apple": { count: 2, word: {...} } }` |
| `attemptHistory` | 시도 이력 `{ "apple": { attempts: 5, correct: 3 } }` |

---

## 🎨 디자인 시스템

- **폰트**: NotoSans (Regular/Medium/SemiBold/Bold)
- **Primary**: #7c3aed (보라)
- **Success**: #10b981 (초록)
- **Danger**: #ef4444 (빨강)
- **Warning**: #f59e0b (노랑)
- **배경**: #faf5ff (연보라)

---

## ⚙️ app.json 수정 필요 항목

배포 전 반드시 변경:
1. `ios.bundleIdentifier` → 실제 번들 ID
2. `android.package` → 실제 패키지 이름
3. `extra.eas.projectId` → EAS 프로젝트 ID
4. 아이콘/스플래시 이미지 → assets/ 폴더에 실제 파일 추가
