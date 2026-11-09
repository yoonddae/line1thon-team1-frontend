// 모든 경로는 여기서 관리합니다. 동적 경로는 함수로 써요. 예: navigate(ROUTES.TREE(treeId))
export const ROUTES = {
  // 시작하기 (로그인 / 가입)
  START: '/',
  SIGNUP: '/signup',

  // 하단 탭
  FOREST: '/forest',
  REVIEW: '/review',
  MY: '/my',

  // 나무
  TREE_CREATE: '/trees/new',
  TREE: (treeId = ':treeId') => `/trees/${treeId}`,
  TREE_EDIT: (treeId = ':treeId') => `/trees/${treeId}/edit`,
  BRANCH: (treeId = ':treeId', branchIndex = ':branchIndex') =>
    `/trees/${treeId}/branches/${branchIndex}`,
  STUDY: (treeId = ':treeId') => `/trees/${treeId}/study`,

  // 잎 상세 (그날 기록)
  LEAF: (leafId = ':leafId') => `/leaves/${leafId}`,

  // 문제 풀기 (첫 풀이·잎눈 재도전·복습 공용) → 결과
  QUIZ: (quizSetId = ':quizSetId') => `/quiz/${quizSetId}`,
  QUIZ_RESULT: (quizSetId = ':quizSetId') => `/quiz/${quizSetId}/result`,
};
