import client from './client';

// ⚠️ S1~S4 상세 명세는 아직 받지 못했어요.
// R2 응답이 "S1과 같은 형태"라는 설명을 바탕으로 아래처럼 가정했어요. 명세가 오면 이 파일만 고치면 됩니다.
//   문제 세트 응답: { quizSetId, quizSetType, leafId?, studyId?, questions: [{ questionId, number, difficulty, questionType, topic, content, options }] }

// S1 공부 입력 + 7문제 출제 (multipart/form-data)
// 가정한 필드: inputType(IMAGE|TEXT), content(텍스트), memo, images(파일 여러 장)
export const createStudy = (treeId, { inputType, content, memo, images = [] }) => {
  const form = new FormData();
  form.append('inputType', inputType);
  if (content) form.append('content', content);
  if (memo) form.append('memo', memo);
  images.forEach((file) => form.append('images', file));
  return client.post(`/trees/${treeId}/studies`, form);
};

// S2 답 제출 + 채점 + 잎 생성·변경 (INITIAL·RETRY·REVIEW 공용)
// 가정한 요청: { answers: [{ questionId, selectedIndex } | { questionId, essayAnswer }] }
export const submitAnswers = (quizSetId, answers) =>
  client.post(`/quiz-sets/${quizSetId}/answers`, { answers });

// S3 잎눈 재도전 → 새 문제 세트(RETRY)
export const retryStudy = (studyId) => client.post(`/studies/${studyId}/retry`);

// S4 풀던 문제 다시 받기
export const getQuizSet = (quizSetId) => client.get(`/quiz-sets/${quizSetId}`);
