import client from './client';

// S1~S4 형식은 Swagger(https://api.30nezog.shop/swagger-ui/index.html) 기준이에요.
//
// QuizSetResponse (S1·S3·S4 응답, R2 도 같은 형태)
//   { studyId, quizSetId, quizSetType, treeId, subjectName, studyLevel,
//     questions: [{ questionId, number, difficulty, questionType, topic, content, options }] }

// S1 공부 입력 + 7문제 출제 (multipart/form-data)
// inputType 필수. IMAGE: images 1~5장(장당 10MB) + memo 선택(200자). TEXT: content 20~5,000자
export const createStudy = (treeId, { inputType, content, memo, images = [] }) => {
  const form = new FormData();
  form.append('inputType', inputType);
  if (content) form.append('content', content);
  if (memo) form.append('memo', memo);
  images.forEach((file) => form.append('images', file));
  return client.post(`/trees/${treeId}/studies`, form);
};

// S2 답 제출 + 채점 + 잎 생성·변경 (INITIAL·RETRY·REVIEW 공용)
// 요청: { answers: [{ questionId, selectedIndex(0~3, 안 풀면 null) } | { questionId, essayText(1,000자) }] }
// 응답 INITIAL·RETRY: { quizSetId, quizSetType, correctCount, gradedCount, leaf, feedback, results }
// 응답 REVIEW: { quizSetId, quizSetType, correctCount, gradedCount, passed, leaf, recoveredTopics, summary, remainingReviewCount, results }
//   leaf = { leafId, beforeGrade, grade, studiedAt, reviewAvailableAt }  ※ position 은 없어요 (T3 에서 leafId 로 찾기)
//   feedback = { summary, strengths, weaknesses, essayFeedback }
//   results[] = { questionId, number, topic, difficulty, questionType, selectedIndex, answerIndex, isCorrect, explanation, essayText, modelAnswer }
export const submitAnswers = (quizSetId, answers) =>
  client.post(`/quiz-sets/${quizSetId}/answers`, { answers });

// S3 잎눈 재도전 → 새 문제 세트(RETRY)
export const retryStudy = (studyId) => client.post(`/studies/${studyId}/retry`);

// S4 풀던 문제 다시 받기
export const getQuizSet = (quizSetId) => client.get(`/quiz-sets/${quizSetId}`);
