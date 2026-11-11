// API 에러 코드별 화면 문구. 서버 message 보다 이 문구를 먼저 써요.
// AI 호출 실패 문구(공부 입력·채점·재도전)는 팀장님 공지(11/10) 문구예요.
export const ERROR_MESSAGES = {
  NICKNAME_INVALID: '닉네임은 2~10자로 입력해 주세요',
  PASSWORD_INVALID: '비밀번호는 숫자 4~6자리로 입력해 주세요',
  NICKNAME_DUPLICATED: '이미 사용 중인 닉네임이에요',
  LOGIN_FAILED: '닉네임 또는 비밀번호가 맞지 않아요',
  TREE_LIMIT_EXCEEDED: '무료 나무는 3그루까지예요',
  TREE_FULL: '나무가 다 자랐어요. 새 나무에서 이어서 공부해 주세요',
  TREE_SHAPE_LOCKED: '아직 열리지 않은 나무 모양이에요',
  TREE_NOT_FOUND: '삭제된 나무예요',
  FORBIDDEN: '이 기록을 열 수 없어요',
  STUDY_INPUT_EMPTY: '노트 사진을 올리거나 공부한 내용을 적어 주세요',
  IMAGE_INVALID: 'jpg·png·webp·heic 사진만, 장당 10MB까지 올릴 수 있어요',
  NOTE_UNREADABLE: '사진을 읽지 못했어요. 공부 내용이 잘 보이게 더 밝게 다시 찍어 주세요',
  CONTENT_TOO_SHORT: '문제를 만들기엔 내용이 조금 적어요. 공부한 내용을 조금 더 적어 주세요',
  ALREADY_SUBMITTED: '이미 제출한 문제예요',
  REVIEW_NOT_AVAILABLE: '아직 복습할 수 없는 잎이에요',
  AI_SERVER_ERROR: '잠시 후 다시 시도해 주세요',
  AI_TIMEOUT: '잠시 후 다시 시도해 주세요',
  NETWORK: '연결을 확인해 주세요',
};

export const MESSAGES = {
  TREE_PURCHASE_SOON: '추가 나무 구매는 준비 중이에요',
  AD_FREE_SOON: '광고 없이 키우기는 준비 중이에요',
};

export const getErrorMessage = (error, fallback = '잠시 후 다시 시도해 주세요') =>
  ERROR_MESSAGES[error?.code] ?? error?.message ?? fallback;
