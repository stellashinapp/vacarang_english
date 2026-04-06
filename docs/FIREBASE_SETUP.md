# Firebase Analytics 설정 (보카랑)

앱에서 **Google Firebase Analytics**를 사용해 다음 이벤트를 기록합니다 (최대 256개 커스텀 이벤트 활용 가능).

- 화면별 조회 (`screen_view`)
- 메뉴 첫 진입 (`menu_first_enter`)
- 게임 시작/클리어 (`game_start`, `game_complete`) — 클리어 시간, 점수 등
- 레벨 선택, 단어장, 오답노트, 샵 진입

## 1. Firebase 프로젝트 만들기

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** → 프로젝트 이름 입력 (예: vacarang)
3. (선택) Google Analytics 사용 설정

## 2. Android 앱 등록 및 google-services.json 받기

1. Firebase 프로젝트에서 **Android 앱 추가**
2. **패키지 이름**: `com.vacarang.app` (app.json과 동일해야 함)
3. **google-services.json** 다운로드
4. 다운로드한 파일을 **프로젝트 루트**에 복사하여 기존 `google-services.json`을 **덮어쓰기**

### 보카랑 잉글리쉬 전용으로 쓰는 경우

**보카랑 잉글리쉬**(패키지 `com.vacarang.english`) 전용 Firebase를 쓰려면:

1. [Firebase Console](https://console.firebase.google.com/) → 같은 프로젝트(또는 새 프로젝트) 선택
2. **프로젝트 설정**(휴지통 옆 톱니바퀴) → **일반** 탭
3. **내 앱**에서 **앱 추가** → **Android** 선택
4. **Android 패키지 이름**에 `com.vacarang.english` 입력 → 앱 등록
5. **google-services.json** 다운로드
6. 다운로드한 파일로 프로젝트 루트의 `google-services.json` **교체**

이렇게 하면 빌드할 때 **보카랑 잉글리쉬** 앱 전용으로 Analytics 등이 수집됩니다.  
(지금은 `package_name`만 `com.vacarang.english`로 바꿔 둔 상태라, Firebase에 해당 앱을 추가한 뒤 위처럼 전용 파일로 교체하면 됩니다.)

```
rn_project/
  google-services.json   ← 여기
  app.json
  package.json
  ...
```

## 3. iOS용 (선택)

iOS 빌드 시에는 Firebase Console에서 iOS 앱을 추가한 뒤 **GoogleService-Info.plist**를 다운로드하고, app.json의 `expo.ios.googleServicesFile`에 경로를 지정합니다.

## 4. 빌드

- **Expo Go**에서는 Firebase 네이티브 모듈이 없어 이벤트는 전송되지 않습니다.
- **EAS Build**로 만든 앱(개발 빌드/프로덕션 빌드)에서만 Analytics가 동작합니다.

```bash
npx eas build -p android --profile production
```

## 5. 이벤트 확인

Firebase Console → **Analytics** → **이벤트**에서 실시간/일별 이벤트를 확인할 수 있습니다.

---

**참고**:
- 프로젝트 루트의 `google-services.json`은 **빌드가 되도록** 넣어 둔 placeholder입니다. **실제 Analytics 수집을 하려면** [Firebase Console](https://console.firebase.google.com/)에서 Android 앱을 추가한 뒤 받은 `google-services.json`으로 **반드시 교체**하세요.
- 교체하지 않으면 빌드는 되지만, Analytics 이벤트는 전송되지 않거나 Firebase 프로젝트에 나타나지 않습니다.
