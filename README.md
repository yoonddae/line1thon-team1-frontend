# line1thon-team1-frontend

라인원톤 1팀 **GROOIT** 프론트엔드 레포입니다. 공부한 내용으로 AI가 문제를 만들고, 결과에 따라 과목 나무에 잎이 자라는 학습 서비스예요.

## 기술 스택

- React 19 + Vite 7 (JavaScript)
- React Router 7
- Tailwind CSS 4
- Axios
- ESLint + Prettier

## 시작하기

```bash
npm install
cp .env.example .env   # 기본값: 배포 서버 https://api.30nezog.shop/api/v1
npm run dev            # http://localhost:5173 (백엔드 CORS 허용 주소라 포트 고정)
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 배포용 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 정렬 |

## 폴더 구조

```
src/
├── apis/            # client.js(공통 axios) + user·tree·study·review·leaf API 함수
├── assets/images/   # logo.svg, tree-base.svg (피그마 시안에서 추출)
├── components/
│   ├── common/      # Button, TextField, Modal, InfoBox, PageHeader, Leaf, AdScreen, Icons ...
│   ├── layout/      # Layout(모바일 폭), TabLayout(하단 탭 숲·복습·정보)
│   └── tree/        # TreeView(잎 24자리 배치), treeSlots.js(잎 자리 좌표)
├── constants/       # routes, study(enum·잎 등급·색), messages(에러 코드별 문구)
├── hooks/           # useApi(조회 API 로딩/에러 처리)
├── pages/           # 화면 단위
├── routes/          # 라우터
└── utils/           # auth(토큰), validation, date
```

`@/` 는 `src/` 를 가리킵니다.

## 디자인 토큰

`src/index.css` 의 `@theme` 에 피그마 색을 넣어 두었어요. 색 코드를 직접 쓰지 말고 클래스로 써 주세요.

| 클래스 | 값 | 쓰임 |
| --- | --- | --- |
| `primary` | #11CC7F | 주 버튼, 선택 |
| `primary-soft` | #E6F8E8 | 선택된 항목 배경 |
| `ink` / `ink-2` / `ink-3` / `ink-4` | #111 / #2C2B29 / #5C5B58 / #8A8884 | 제목 / 본문 / 보조 / 비활성 |
| `bg` / `surface` / `subtle` / `info` | #F0F0F0 / #FFF / #F3F2F0 / #E8E6E2 | 화면 / 카드 / 모달 안 박스 / 안내 박스 |
| `line` | #D6D3CE | 입력 테두리, 보조 버튼 |
| `danger` | #FF6D6D | 삭제, 에러 |

## 나무와 잎

- `tree-base.svg` 는 시안의 나무에서 잎을 뺀 그림이고, `treeSlots.js` 는 시안의 잎 24개 자리예요.
- `TreeView` 가 T3 `leaves` 를 `position` 순서로 왼쪽 가지부터(5·7·7·5) 채우고 `grade` 색으로 칠해요.
- `branchIndex` 를 넘기면 그 가지만 확대하고 날짜를 표시해요.

## 화면과 API

| 경로 | 화면 | API |
| --- | --- | --- |
| `/` | 스플래시 | - |
| `/login` | 시작하기 - 로그인 | U2 |
| `/signup` | 시작하기 - 가입 | U1 |
| `/forest` | 숲 (탭) | T1, T3, 이어 풀기 S4 |
| `/review` | 복습 (탭) | R0 → R2 |
| `/my` | 정보 (탭) | U3, U4, U5, U6 |
| `/trees/new` | 나무 만들기 | T2 |
| `/trees/:treeId` | 나무 (메뉴·삭제·복습 시트) | T3, T5, R1 → R2 |
| `/trees/:treeId/edit` | 나무 수정 | T4 |
| `/trees/:treeId/branches/:branchIndex` | 가지 확대 · 잎 붙이기(채점 결과 모달) | T3, S3, A1 |
| `/trees/:treeId/study` | 공부 입력 | S1 |
| `/quiz/:quizSetId` | 문제 풀기 (첫 풀이·재도전·복습) | S4(새로고침 시), S2 |
| `/quiz/:quizSetId/result` | 복습 결과 / 첫 풀이·재도전은 가지 확대로 이동 | T3 |
| `/leaves/:leafId` | 잎 상세 (그날 기록) | L2, A1 |

> S1~S4 요청·응답 형식은 [Swagger](https://api.30nezog.shop/swagger-ui/index.html) 기준으로 `src/apis/study.js` 주석에 정리했어요.

## 협업 규칙

### 브랜치

- `main`: 항상 실행 가능한 상태 유지
- 작업 브랜치: `feat/기능명`, `fix/버그명`, `chore/설정명` (예: `feat/quiz-page`)
- 작업 후 PR → 팀원 1명 확인 후 merge

### 커밋 메시지

| 태그 | 용도 |
| --- | --- |
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `style` | UI·스타일 변경 |
| `refactor` | 동작 변화 없는 코드 정리 |
| `chore` | 설정, 패키지 |
| `docs` | 문서 |

예: `feat: 문제 풀이 화면 답안 저장 상태 표시`
