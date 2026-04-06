# "보카랑 잉글리쉬" 앱에 올리는 AAB 만들기 (6F:E8… 키로 서명)

Play Console의 **보카랑 잉글리쉬** 앱은 **6F:E8…** 키로 서명된 AAB만 받습니다.  
지금 EAS에서 com.vacarang.english로 빌드하면 **74:8C…** 키로 서명되므로, **6F:E8… Keystore를 로컬에서 사용**해야 합니다.

---

## 1단계: 6F:E8… Keystore 받기

1. **app.json**에서 패키지를 **잠시** com.vacarang.app으로 바꿉니다.
   - `"package": "com.vacarang.english"` → `"package": "com.vacarang.app"`
   - `"bundleIdentifier": "com.vacarang.english"` → `"bundleIdentifier": "com.vacarang.app"`
   - google-services.json의 `"package_name"` → `"com.vacarang.app"`

2. 터미널에서 실행:
   ```powershell
   npx eas credentials -p android
   ```
   - **production** 선택
   - **credentials.json: Upload/Download credentials between EAS servers and your local json** 선택
   - **Download credentials from EAS to credentials.json** 선택

3. 프로젝트 루트에 **credentials.json**과 **Keystore 파일**이 생깁니다. (경로는 credentials.json 안에 적혀 있음)

4. **app.json**을 다시 **com.vacarang.english**로 되돌립니다.
   - `"package": "com.vacarang.app"` → `"package": "com.vacarang.english"`
   - `"bundleIdentifier": "com.vacarang.app"` → `"bundleIdentifier": "com.vacarang.english"`
   - google-services.json의 `"package_name"` → `"com.vacarang.english"`

---

## 2단계: 빌드 (로컬 Keystore 사용)

이미 **eas.json** production에 `"credentialsSource": "local"` 이 들어 있어 있습니다.

```powershell
npx eas build -p android --profile production
```

- 이 빌드는 **com.vacarang.english** 패키지로 나가고, **credentials.json에 적힌 6F:E8… Keystore**로 서명됩니다.
- 나온 AAB를 **보카랑 잉글리쉬** 앱에 업로드하면 서명 오류 없이 올라갑니다.

---

## 요약

| 할 일 | 설명 |
|--------|------|
| 1 | app.json 패키지를 com.vacarang.app으로 바꾸기 |
| 2 | `eas credentials` → Download로 6F:E8… Keystore 받기 |
| 3 | app.json 패키지를 com.vacarang.english로 되돌리기 |
| 4 | `npx eas build -p android --profile production` 실행 |
| 5 | 생성된 AAB를 Play Console **보카랑 잉글리쉬**에 업로드 |
