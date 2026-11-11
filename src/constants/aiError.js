// AI 를 부르는 화면(공부 입력 S1 · 채점 S2 · 잎눈 재도전 S3)의 실패 처리 — 팀장님 공지(11/10)
// error.code 로 사용자가 할 일 3가지만 나눠요.
//
// RETRY  ① 다시 시도: 같은 입력으로 다시 보내면 됨 → 로딩 실패 화면 [다시 시도하기] [닫기]
//        (입력한 글·사진·고른 답은 화면 state 에 그대로 남아요)
// INPUT  ② 입력 고치기: 공부 입력 화면 위 팝업 [확인] (입력은 그대로)
// NOTICE ③ 안내만: 팝업 [확인]
// IGNORE REQUEST_IN_PROGRESS(409): 버튼 두 번 눌림 → 아무것도 띄우지 않음
// 401 은 apis/client.js 에서 로그인 화면으로 보내요.
export const AI_ERROR_KIND = { RETRY: 'RETRY', INPUT: 'INPUT', NOTICE: 'NOTICE', IGNORE: 'IGNORE' };

const KIND_BY_CODE = {
  AI_SERVER_ERROR: 'RETRY', // 502
  AI_TIMEOUT: 'RETRY', // 504 · 60초 초과
  NETWORK: 'RETRY', // 인터넷 끊김
  INTERNAL_ERROR: 'RETRY',

  NOTE_UNREADABLE: 'INPUT',
  CONTENT_TOO_SHORT: 'INPUT',
  IMAGE_INVALID: 'INPUT',
  STUDY_INPUT_EMPTY: 'INPUT',

  TREE_FULL: 'NOTICE',

  REQUEST_IN_PROGRESS: 'IGNORE',
};

// 모르는 코드는 "다시 시도" 로 처리해요 (서버는 실패하면 아무것도 저장하지 않아요)
export const aiErrorKind = (error) => KIND_BY_CODE[error?.code] ?? AI_ERROR_KIND.RETRY;

// 피그마처럼 작은 글씨로 보여줄 "AI_SERVER_ERROR(502)"
export const errorCodeLabel = (error) => {
  if (!error?.code) return '';
  return error.status ? `${error.code}(${error.status})` : error.code;
};
