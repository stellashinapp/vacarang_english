# Play Console 업로드 오류 해결: 개인정보처리방침

## 오류 메시지
> "APK 또는 Android App Bundle에서 개인정보처리방침이 필요한 권한을 사용합니다(android.permission.RECORD_AUDIO)"

앱에서 **RECORD_AUDIO** 권한(음성 녹음)이 포함되어 있어, Google Play 정책상 **개인정보처리방침 URL**을 등록해야 합니다.  
(보카랑은 TTS/효과음만 사용하며 녹음은 하지 않습니다.)

---

## 해결 방법

### 1. 개인정보처리방침 페이지 준비
- 프로젝트 루트의 **`PRIVACY_POLICY.md`** 내용을 웹 페이지로 공개하세요.
- 예시:
  - **GitHub**: 저장소 → Settings → Pages → 본문을 HTML/Markdown으로 배포 후 URL 확보
  - **Notion**: 새 페이지에 내용 붙여넣기 → "공개로 공유" → 링크 복사
  - **자사 웹사이트**: 별도 페이지에 붙여넣기 후 URL 확보

### 2. Play Console에 URL 등록
1. [Google Play Console](https://play.google.com/console) 로그인
2. 해당 앱(**보카랑**) 선택
3. **정책** → **앱 콘텐츠** (또는 **앱 정보**)
4. **개인정보처리방침** 항목 찾기
5. **개인정보처리방침 URL**에 1번에서 만든 주소 입력 (예: `https://yoursite.com/privacy`)
6. 저장 후, **다시 AAB 업로드**

업로드 시 동일한 권한이면 이미 등록한 URL로 정책을 충족하게 됩니다.

---

## 참고
- URL은 **https**로 접근 가능한 공개 주소여야 합니다.
- 앱 업데이트 시 개인정보처리방침을 수정했다면, 해당 페이지 내용만 갱신하면 됩니다.
