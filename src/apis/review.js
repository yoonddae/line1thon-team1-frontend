import client from './client';

// R0 전체 복습 목록 → { totalCount, nextReviewAt, reviews: [...] }
export const getReviews = () => client.get('/reviews');

// R1 나무별 복습 목록 → { treeId, subjectName, reviews: [...] }
export const getTreeReviews = (treeId) => client.get(`/trees/${treeId}/reviews`);

// R2 복습 3문제 출제 → 문제 세트(REVIEW). 풀던 복습 세트가 있으면 그걸 다시 줘요.
export const createReview = (leafId) => client.post(`/leaves/${leafId}/reviews`);
