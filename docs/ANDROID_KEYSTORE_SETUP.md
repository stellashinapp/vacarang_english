# 6F:E8… Keystore로 서명하기 (기존 앱 업로드용)

Play Console이 요구하는 서명 키(SHA1: `6F:E8:BB:1B:3D:D6:91:44:4A:C0:68:4E:24:70:F5:55:CE:C8:1F:A6`)로 빌드하려면, **그 키가 들어 있는 Keystore 파일**이 필요합니다.

---

## 1. Keystore 파일 구하기

- **처음에 Play에 올린 AAB**를 누가/어디서 빌드했는지 확인하세요.
  - **EAS로만 빌드했다면**  
    예전에 다른 프로젝트나 다른 계정으로 빌드했을 수 있습니다. 그때 쓰인 Keystore를 그 계정에서 내려받거나, 팀원에게 받아야 합니다.
  - **로컬에서 빌드했다면**  
    그때 사용한 `.jks` 또는 `.keystore` 파일을 찾아서 복사해 오세요.
- **파일이 없다면**  
  Play Console → **설정** → **앱 무결성** (또는 **앱 서명**)에서 **업로드 키 초기화**가 있는지 확인해 보세요. (정책에 따라 74:8C… 키를 새 업로드 키로 등록할 수 있는 경우가 있습니다.)

---

## 2. Keystore SHA1 확인

받은 Keystore가 6F:E8… 인지 확인하려면:

```powershell
keytool -list -v -keystore android\keystores\release.keystore
```

비밀번호 입력 후 출력된 **인증서 지문** 중 **SHA1**이  
`6F:E8:BB:1B:3D:D6:91:44:4A:C0:68:4E:24:70:F5:55:CE:C8:1F:A6` 이면 맞는 키입니다.

---

## 3. Keystore 넣기

1. Keystore 파일을 프로젝트의 **`android/keystores/`** 폴더에 넣습니다.  
   예: `android/keystores/release.keystore` (파일명은 자유)
2. `credentials.json.example` 을 복사해 **`credentials.json`** 으로 만듭니다.
3. **`credentials.json`** 을 열어서 아래를 **실제 값**으로 바꿉니다.
   - **keystorePath**: Keystore 파일 경로 (예: `android/keystores/release.keystore`)
   - **keystorePassword**: Keystore 비밀번호
   - **keyAlias**: 키 별칭 (keytool 목록에 나오는 alias)
   - **keyPassword**: 키 비밀번호

예시:

```json
{
  "android": {
    "keystore": {
      "keystorePath": "android/keystores/release.keystore",
      "keystorePassword": "실제키스토어비밀번호",
      "keyAlias": "실제별칭",
      "keyPassword": "실제키비밀번호"
    }
  }
}
```

4. **`credentials.json`** 과 **`android/keystores/*.keystore`** 는 `.gitignore`에 들어 있어야 합니다. (이미 추가됨)

---

## 4. 빌드하기

로컬에서:

```powershell
cd C:\Users\AndNew07\Desktop\oxford_word_play_react_native\rn_project
npx eas build -p android --profile production
```

`eas.json`의 production에 **`credentialsSource": "local"`** 이 들어 있으므로, 이 빌드는 **`credentials.json`에 적어 둔 Keystore(6F:E8…)** 로 서명됩니다.  
생성된 AAB를 Play Console에 올리면 “잘못된 키로 서명되었습니다” 오류 없이 올라가야 합니다.

---

## 요약

| 단계 | 할 일 |
|------|--------|
| 1 | 6F:E8… 인 **Keystore 파일** 구하기 |
| 2 | `android/keystores/` 에 넣고, **keytool** 로 SHA1 확인 |
| 3 | **credentials.json** 만들고 경로·비밀번호·alias 입력 |
| 4 | **npx eas build -p android --profile production** 실행 |

Keystore 파일을 구한 뒤 위 순서대로 하시면 됩니다.
