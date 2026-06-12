# Firebase 설정

1. Firebase Console에서 프로젝트를 생성한다.
2. 웹 앱을 등록하고 설정 객체를 복사한다.
3. `scripts/thread/config.js` 값을 교체한다.
4. Authentication에서 Anonymous를 활성화한다.
5. Authentication에서 Google을 활성화한다.
6. 승인된 도메인에 GitHub Pages 도메인을 추가한다.
7. Firestore 데이터베이스를 생성한다.
8. Google 로그인 후 `admin.html`을 연다.
9. 화면에 표시된 UID를 복사한다.
10. `config.js`의 `ADMIN_UIDS`를 교체한다.
11. `firestore.rules`의 관리자 UID도 교체한다.
12. Firebase CLI로 보안 규칙을 배포한다.

```powershell
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## TTL 설정

1. Firestore Console의 TTL 정책을 연다.
2. 컬렉션 그룹에 `threads`를 입력한다.
3. TTL 필드에 `expiresAt`을 입력한다.
4. 정책을 활성화한다.

TTL 실제 삭제는 지연될 수 있다.  
웹 화면에서는 만료 즉시 숨긴다.

## 관리자 사용

- `/admin.html`에 접속한다.
- 등록한 Google 계정으로 로그인한다.
- 선택, 만료, 전체 삭제를 사용한다.
- 관리자 UID 변경 시 규칙을 재배포한다.

## 확인 항목

- 익명 로그인과 첫 글 작성
- 같은 사용자의 중복 작성 차단
- 추천, 비추천, 취소, 전환
- 점수별 어둡게, 가림, 삭제
- 한 시간 후 목록 제거
- 관리자 외 삭제 거부
