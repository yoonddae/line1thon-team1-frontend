import client from './client';

// T1 숲 → { freeTreeLimit, treeCount, canAddFreeTree, trees: [...] }
export const getTrees = () => client.get('/trees');

// T2 나무 추가 { subjectName, studyLevel, treeShape, backgroundColor }
export const createTree = ({ subjectName, studyLevel, backgroundColor }) =>
  client.post('/trees', { subjectName, studyLevel, treeShape: 'BASIC', backgroundColor });

// T3 나무 상세 (잎 배치, 풀던 문제 pendingQuizSetId)
export const getTree = (treeId) => client.get(`/trees/${treeId}`);

// T4 나무 수정 (보낸 필드만 바뀜)
export const updateTree = (treeId, fields) => client.patch(`/trees/${treeId}`, fields);

// T5 나무 삭제
export const deleteTree = (treeId) => client.delete(`/trees/${treeId}`);
