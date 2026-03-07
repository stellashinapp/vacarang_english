# 개인정보처리방침 URL 만들기 (GitHub Pages)

프로젝트에 **`privacy.html`** 파일이 있습니다. 이걸로 Play Console에 넣을 **공개 URL**을 만드는 방법입니다.

---

## 1. GitHub에 올리기

1. 이 프로젝트가 이미 **GitHub 저장소**에 있다면:
   - `privacy.html` 파일을 **저장소 루트**에 두고 커밋·푸시합니다.
   - (이미 루트에 있으므로 그대로 푸시하면 됩니다.)

2. **아직 GitHub 저장소가 없다면:**
   - [GitHub](https://github.com) 로그인 → **New repository** 생성 (이름 예: `vacarang` 또는 `vacarang-privacy`)
   - 로컬에서:
     ```bash
     cd rn_project
     git add privacy.html
     git commit -m "Add privacy policy page"
     git remote add origin https://github.com/<당신의사용자명>/<저장소이름>.git
     git push -u origin main
     ```
   - 또는 GitHub 웹에서 **Upload files**로 `privacy.html`만 올려도 됩니다.

---

## 2. GitHub Pages 켜기

1. 해당 저장소 페이지에서 **Settings** 클릭.
2. 왼쪽 메뉴에서 **Pages** 선택.
3. **Build and deployment** → **Source**를 **Deploy from a branch**로 선택.
4. **Branch**에서 `main`(또는 사용 중인 브랜치), **Folder**에서 **/ (root)** 선택.
5. **Save** 클릭.

---

## 3. 개인정보처리방침 URL 확인

1~2분 후 아래 주소로 접속해 보세요.

- **형식:** `https://<GitHub사용자명>.github.io/<저장소이름>/privacy.html`
- **예:** 저장소 이름이 `vacarang`이면  
  `https://stella-shin.github.io/vacarang/privacy.html`

이 **URL을 복사**해서 Play Console → 정책 → 앱 콘텐츠 → 개인정보처리방침에 붙여넣으면 됩니다.

---

## 참고

- **저장소를 “보카랑 앱 전용”으로 쓰지 않아도 됩니다.**  
  개인정보처리방침 페이지만 필요하면, `vacarang-privacy` 같은 이름으로 새 저장소를 만들고 `privacy.html` 하나만 넣어도 됩니다.
- Notion은 제가 대신 만들어 줄 수 없으므로, **GitHub Pages + 이 `privacy.html`** 조합이 제가 도와드릴 수 있는 방법입니다.
