// API 명세서 enum 기준 도메인 상수

// 공부 수준 studyLevel
export const STUDY_LEVELS = [
  { value: 'ELEMENTARY', label: '초등학생' },
  { value: 'MIDDLE', label: '중학생' },
  { value: 'HIGH', label: '고등학생' },
  { value: 'UNIVERSITY', label: '대학생' },
  { value: 'SELF_STUDY', label: '개인 공부' },
];
export const STUDY_LEVEL_LABEL = Object.fromEntries(STUDY_LEVELS.map((l) => [l.value, l.label]));

// 나무 배경 색상 backgroundColor (기본 BLUE). from 은 그라데이션 시작색이에요.
export const BACKGROUNDS = [
  { value: 'PINK', label: '분홍', from: '#F2CCBE' },
  { value: 'YELLOW', label: '노랑', from: '#F2E6BE' },
  { value: 'GREEN', label: '초록', from: '#BEF2C0' },
  { value: 'BLUE', label: '하늘', from: '#BEE1F2' },
];
export const DEFAULT_BACKGROUND = 'BLUE';
export const getBackground = (value) =>
  BACKGROUNDS.find((b) => b.value === value) ?? BACKGROUNDS.find((b) => b.value === DEFAULT_BACKGROUND);

export const FREE_TREE_LIMIT = 3;
export const MAX_LEAVES = 24;
export const BRANCH_SIZES = [5, 7, 7, 5]; // 왼쪽 가지부터. position 1~5, 6~12, 13~19, 20~24

// 잎 등급 grade (서술형을 뺀 6문제 기준)
export const GRADE = {
  GREEN: 'GREEN', // 6 싱싱한 잎
  LIGHT_GREEN: 'LIGHT_GREEN', // 5~4 연두잎
  AUTUMN: 'AUTUMN', // 3~2 단풍잎 → 3일 뒤 복습
  BROWN: 'BROWN', // 1 마른 잎 → 3일 뒤 복습
  BUD: 'BUD', // 0 잎눈 → 재도전
};

export const GRADE_INFO = {
  [GRADE.GREEN]: { label: '싱싱한 잎', message: '완벽하게 이해했어요' },
  [GRADE.LIGHT_GREEN]: { label: '연두잎', message: '잘 이해했어요' },
  [GRADE.AUTUMN]: { label: '단풍잎', message: '조금 더 다지면 싱싱한 잎이 돼요' },
  [GRADE.BROWN]: { label: '마른 잎', message: '다시 공부가 필요해요' },
  [GRADE.BUD]: { label: '잎눈', message: '기록은 남기고 다시 도전해요' },
};

// 피그마 잎 에셋 색 (base: 잎 바탕, from→to: 그늘 그라데이션). 최종 시안 Grade=* 에셋과 같아요.
export const GRADE_COLOR = {
  [GRADE.GREEN]: { base: '#00BC71', from: '#006B40', to: '#00BC70' },
  [GRADE.LIGHT_GREEN]: { base: '#7DBC00', from: '#588400', to: '#7DBC00' },
  [GRADE.AUTUMN]: { base: '#FFD500', from: '#AA6000', to: '#FFD400' },
  [GRADE.BROWN]: { base: '#624025', from: '#2E1F13', to: '#624025' },
  [GRADE.BUD]: { base: '#86FF61', from: '#46C221', to: '#86FF61' },
};

export const isReviewTarget = (grade) => grade === GRADE.AUTUMN || grade === GRADE.BROWN;

// 문제
export const QUIZ_SET_TYPE = { INITIAL: 'INITIAL', RETRY: 'RETRY', REVIEW: 'REVIEW' };
export const QUESTION_TYPE = { MULTIPLE_CHOICE: 'MULTIPLE_CHOICE', ESSAY: 'ESSAY' };
export const DIFFICULTY_LABEL = { EASY: '쉬움', NORMAL: '보통', HARD: '어려움', ESSAY: '서술형' };
export const INPUT_TYPE = { IMAGE: 'IMAGE', TEXT: 'TEXT' };
export const AD_PLACEMENT = { LEAF_PLACEMENT: 'LEAF_PLACEMENT', RECORD_VIEW: 'RECORD_VIEW' };
