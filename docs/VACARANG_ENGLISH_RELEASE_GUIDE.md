# 보카랑 잉글리쉬 출시 가이드 (차근차근)

Play Console **보카랑 잉글리쉬**에 AAB를 올리고, Firebase Analytics까지 제대로 쓰기 위한 순서입니다.  
각 단계마다 **확인 방법**과 **흔한 오류/해결**을 적어 두었습니다.

---

## 준비 상태 (이미 되어 있으면 건너뛰기)

- [ ] **credentials.json** + **credentials/android/keystore.jks** 가 로컬에 있음 (6F:E8… 키)
- [ ] **eas.json** production에 `"credentialsSource": "local"` 있음
- [ ] **app.json** 에 `package`: `com.vacarang.english`, `name`: `보카랑 잉글리쉬` 로 되어 있음

이미 했다면 **1단계(Firebase)** 부터 진행하면 됩니다.

---

## 1단계: Firebase에 보카랑 잉글리쉬 앱 등록

**목적:** 앱 사용 통계(Analytics)를 보카랑 잉글리쉬 전용으로 받기 위함.

### 1-1. Firebase Console 들어가기

1. 브라우저에서 **https://console.firebase.google.com/** 접속
2. **“시작하기”** 카드가 크게 보이면 → 아직 **프로젝트를 선택 안 한 상태**
   - 왼쪽 상단 **프로젝트 이름** 클릭 → **기존 프로젝트 선택** (예: vacarang)
   - 또는 **프로젝트 추가** 로 새로 만든 뒤 아래 진행

### 1-2. Android 앱 추가

1. **프로젝트 설정** (휴지통 옆 **톱니바퀴** 아이콘) 클릭
2. **일반** 탭 → 아래로 내려서 **내 앱** 섹션
3. **앱 추가** → **Android** (로봇 아이콘) 선택
4. **Android 패키지 이름** 에 **정확히** 입력: `com.vacarang.english`
5. (닉네임은 비워도 됨) → **앱 등록** 클릭
6. 다음 화면에서 **google-services.json** **다운로드** 버튼 클릭

### 1-3. 프로젝트에 파일 넣기

1. 다운로드한 **google-services.json** 파일을 찾기
2. 이 파일을 **프로젝트 루트**로 복사해서, 기존 `google-services.json` **덮어쓰기**
   - 경로: `rn_project/google-services.json`

### ✅ 1단계 확인

- [ ] Firebase Console **프로젝트 설정 → 일반 → 내 앱** 에 **com.vacarang.english** 가 보임
- [ ] `rn_project/google-services.json` 을 열었을 때 `"package_name": "com.vacarang.english"` 가 있음

### ⚠️ 1단계에서 나올 수 있는 오류

| 상황 | 원인 | 해결 |
|------|------|------|
| “프로젝트 설정”을 못 찾겠음 | 프로젝트를 선택하지 않음 | 왼쪽 상단에서 **프로젝트 이름** 클릭 후 기존 프로젝트 선택 |
| 패키지 이름 오류 (나중에 빌드 시) | 오타 또는 공백 | `com.vacarang.english` 만 입력, 앞뒤 공백 없이 |
| Analytics에 데이터가 안 보임 | 잘못된 json 사용 | Firebase에서 **com.vacarang.english** 앱용으로 받은 파일로 **반드시 교체** |

---

## 2단계: AAB 빌드 (로컬 Keystore 사용)

**목적:** 6F:E8… 키로 서명된 **보카랑 잉글리쉬** AAB 만들기.

### 2-1. 빌드 실행

프로젝트 루트(`rn_project`)에서 터미널 열고:

```powershell
npx eas build -p android --profile production
```

- 로그인/프로젝트 선택 하라는 메시지 나오면 따라 하기
- **빌드가 끝날 때까지** 기다리기 (몇 분~십 수 분)

### 2-2. 빌드 완료 후

- 터미널에 **🤖 Android app:** 다음에 **URL** 이 나옴  
  예: `https://expo.dev/artifacts/eas/xxxx.aab`
- 이 URL을 브라우저에서 열어 **.aab 파일 다운로드**

### ✅ 2단계 확인

- [ ] 빌드 로그 끝에 **Build finished** / **✔ Build finished** 가 보임
- [ ] URL로 들어가서 **.aab** 파일을 다운로드할 수 있음
- (선택) 서명 확인: Play Console에 올린 뒤 “앱 서명” 화면에서 **업로드 키 SHA-1** 이 **6F:E8:BB:1B:3D:D6:91:44:4A:C0:68:4E:24:70:F5:55:CE:C8:1F:A6** 와 같으면 정상

### ⚠️ 2단계에서 나올 수 있는 오류

| 오류 메시지 / 상황 | 원인 | 해결 |
|--------------------|------|------|
| **credentials** 관련 오류 | credentials.json 없음 또는 경로/형식 잘못됨 | 1) `credentials.json` 이 프로젝트 루트에 있는지 확인 2) `eas credentials -p android` → Download 로 다시 받기 |
| **google-services.json** 관련 빌드 실패 | 파일 없음 또는 JSON 형식 깨짐 | 1) 루트에 `google-services.json` 있는지 확인 2) Firebase에서 받은 원본으로 다시 교체 (한글 경로/이름 피하기) |
| **잘못된 키로 서명되었습니다** (Play Console) | 74:8C… 등 다른 키로 서명됨 | `eas.json` production에 `"credentialsSource": "local"` 있는지 확인 후, 로컬 credentials로 다시 빌드 |
| 빌드가 계속 실패함 | EAS/Node 버전, 네트워크 등 | 터미널 **전체 로그** 끝부분(에러 메시지)을 복사해 두고, 필요하면 Expo 포럼/문서에서 해당 메시지로 검색 |

---

## 3단계: Play Console에 AAB 업로드

**목적:** 보카랑 잉글리쉬 앱을 스토어에 출시/테스트 트랙에 올리기.

### 3-1. 업로드

1. **https://play.google.com/console** 접속 → 로그인
2. **보카랑 잉글리쉬** 앱 선택
3. 왼쪽 메뉴 **출시** → **프로덕션** (또는 **테스트** / **내부 테스트**)
4. **새 버전 만들기** (또는 **버전 만들기**)
5. **앱 번들** 섹션에서 **AAB 업로드** → 2단계에서 받은 **.aab** 선택
6. 버전 이름/릴리스 노트 입력 후 **저장** → **검토 후 출시** (또는 **검토** 후 제출)

### ✅ 3단계 확인

- [ ] 업로드 후 **“이 앱 번들은 업로드 키로 서명되었습니다”** 같은 메시지가 나오고, 오류 없이 저장됨
- [ ] **앱 무결성** 또는 **앱 서명** 화면에서 업로드 키 SHA-1 이 **6F:E8:BB:1B:3D:D6:91:44:4A:C0:68:4E:24:70:F5:55:CE:C8:1F:A6** 로 표시됨

### ⚠️ 3단계에서 나올 수 있는 오류

| 오류 / 상황 | 원인 | 해결 |
|-------------|------|------|
| **잘못된 키로 서명되었습니다** | AAB가 6F:E8… 가 아닌 다른 키로 서명됨 | 2단계를 **로컬 credentials** 로 다시 빌드 (eas.json `credentialsSource: "local"`, credentials.json·keystore 확인) |
| **버전 코드가 이미 사용됨** | 이전에 올린 버전과 versionCode 동일 | app.json 의 `android.versionCode` 를 **더 큰 숫자**로 올린 뒤 다시 빌드 → 새 AAB 업로드 |
| **패키지 이름이 일치하지 않습니다** | Play Console 앱과 AAB 패키지가 다름 | app.json `android.package` 가 **com.vacarang.english** 인지 확인 후 다시 빌드 |

---

## 4단계: 제대로 나왔는지 최종 확인

- **Play Console**
  - 출시 대시보드에 새 버전이 올라가 있고, 서명 오류/경고가 없음
  - **앱 서명** 에서 업로드 키 SHA-1 이 6F:E8… 로 나옴
- **Firebase**
  - 실제 기기에서 **보카랑 잉글리쉬** 앱을 설치해 몇 번 화면 이동/게임 실행
  - Firebase Console → **Analytics** → **이벤트** 에서 (몇 분~몇 시간 후) 이벤트가 쌓이면 정상

---

## 요약 체크리스트

| 순서 | 할 일 | 확인 |
|------|--------|------|
| 1 | Firebase에 com.vacarang.english Android 앱 추가 → google-services.json 다운로드 | package_name 이 com.vacarang.english |
| 2 | 받은 google-services.json 을 rn_project 루트에 덮어쓰기 | 파일 존재, JSON 형식 정상 |
| 3 | `npx eas build -p android --profile production` 실행 | Build finished, AAB URL 받음 |
| 4 | AAB 다운로드 후 Play Console 보카랑 잉글리쉬에 업로드 | 서명 오류 없음, 업로드 키 6F:E8… |
| 5 | (선택) 앱 실행 후 Firebase Analytics 이벤트 확인 | 이벤트 목록에 데이터 표시 |

이 순서대로 하면 **제대로 나옵니다.**  
중간에 오류가 나오면 위 표의 **해결** 칸을 보고, 그래도 안 되면 **나온 오류 메시지 전체**를 알려주면 다음 단계 짚어줄 수 있습니다.
