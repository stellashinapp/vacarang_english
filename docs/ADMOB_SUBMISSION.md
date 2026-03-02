# AdMob 앱 제출 가이드

앱을 AdMob에 등록하고 광고를 연동·제출하기 위한 단계입니다.

---

## 1. AdMob 콘솔에서 앱 등록

1. [AdMob](https://admob.google.com) 로그인 후 **앱** → **앱 추가** 선택.
2. **Android** / **iOS** 중 플랫폼 선택 후, 스토어에 이미 올라간 앱이 있으면 선택, 없으면 **앱이 스토어에 없음** 선택 후 앱 이름·패키지명 입력.
   - 현재 앱 패키지명: `com.vacarang.app`
3. 등록이 끝나면 **앱 ID**가 발급됩니다 (형식: `ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx`).
4. **광고 단위** 생성:
   - **배너**: 앱 선택 → 광고 단위 → 배너 → 단위 이름 입력 후 생성 → **광고 단위 ID** 복사 (`ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx`).
   - **전면 광고**(선택): 동일하게 전면 광고 단위 생성 후 ID 복사.
   - **보상형**(선택): 보상형 광고 단위 생성 후 ID 복사.

---

## 2. 앱에 AdMob SDK 연동 (Expo)

현재 프로젝트는 배너 영역만 있고 실제 광고 SDK는 미연동 상태입니다. 아래 순서로 연동하면 됩니다.

### 2-1. 패키지 설치

```bash
cd rn_project
npx expo install react-native-google-mobile-ads
```

### 2-2. app.json 설정

**방법 A** – 플러그인 인자로 전달 (expo.plugins 배열에 추가):

```json
"plugins": [
  "expo-font",
  ["expo-build-properties", { ... }],
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
      "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
    }
  ]
]
```

**방법 B** – 루트에 설정 객체 (일부 Expo 버전):

```json
{
  "expo": { "plugins": ["react-native-google-mobile-ads"] },
  "react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
    "ios_app_id": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
  }
}
```

- **앱 ID**는 AdMob 콘솔 → 앱 → 앱 설정에서 확인 (형식: `ca-app-pub-xxxx~xxxx`).
- Android만 쓸 경우 iOS 앱 ID는 빈 문자열 `""` 가능. iOS만 쓸 경우 Android 동일.
- 네이티브 모듈이므로 `eas build`로 새 빌드 필요. Expo Go에서는 동작하지 않을 수 있음.

### 2-3. 광고 단위 ID 사용

- 배너·전면·보상형 광고 단위 ID는 각각 `src/services/ads.js`, `src/components/BannerAd.js` 등에서 사용합니다.
- **테스트 시**에는 AdMob에서 제공하는 테스트 ID 사용 권장:
  - Android 배너: `ca-app-pub-3940256099942544/6300978111`
  - iOS 배너: `ca-app-pub-3940256099942544/2934735716`

---

## 3. 개인정보처리방침 (필수)

AdMob 및 스토어 정책상 **개인정보처리방침 URL**이 필요합니다.

- 앱에서 수집하는 정보(광고 식별자, 사용 통계 등)와 이용 목적을 명시.
- 웹에 페이지를 만들어 공개 URL을 준비 (예: GitHub Pages, Notion 공개 페이지, 본인 블로그 등).
- Play Store / App Store 앱 등록 시 **개인정보처리방침** 필드에 해당 URL 입력.
- AdMob 앱 설정에서도 개인정보처리방침 URL을 등록할 수 있습니다.

---

## 4. 스토어 제출 시 참고

- **Google Play**: 앱에 광고가 포함됐음을 표시하고, 개인정보처리방침 URL을 입력합니다.
- **Apple App Store**: 동일하게 광고 포함 여부 및 개인정보처리방침 URL을 입력합니다.
- **EAS Build** 사용 시:
  - `eas build -p android --profile production` (또는 사용 중인 프로필)
  - 빌드 완료 후 `eas submit` 또는 Play Console / App Store Connect에 직접 업로드.

---

## 5. 현재 프로젝트 상태

| 항목 | 상태 |
|------|------|
| 배너 영역 UI | ✅ `BannerAd.js` (플레이스홀더) |
| 광고 제거 구매 | ✅ `AdsContext`, `RemoveAdsScreen` |
| 전면/보상형 호출 | ✅ `ResultScreen` 등에서 `showInterstitial`/`showRewarded` 호출 |
| 실제 AdMob SDK | ❌ 미연동 (`services/ads.js`는 빈 함수) |
| app.json AdMob 플러그인 | ❌ 추가 필요 (위 2-2 참고) |

AdMob 앱 ID·광고 단위 ID를 발급받은 뒤, 위 2단계대로 패키지 설치 및 `app.json` 수정 후 `src/services/ads.js`와 `BannerAd.js`에 `react-native-google-mobile-ads` API를 연동하면 제출 가능한 상태가 됩니다.
