import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Loading from '@/components/common/Loading';
import ReviewResult from './ReviewResult';
import { branchOf } from '@/components/tree/TreeView';
import { getTree } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { QUIZ_SET_TYPE } from '@/constants/study';

// 채점 결과 (S2 응답, 형식은 src/apis/study.js 주석 참고)
// - 복습: 복습 결과 모달 (A11)
// - 첫 풀이·재도전: 새 잎이 붙을 가지 확대 화면으로 이동해 결과 모달을 띄워요 (시안 #19·#20)
export default function QuizResultPage() {
  const { state } = useLocation();
  if (!state?.result) return <Navigate to={ROUTES.FOREST} replace />;

  if (state.quizSetType === QUIZ_SET_TYPE.REVIEW) {
    return <ReviewResult result={state.result} context={state.context ?? {}} />;
  }
  return <GoToBranch result={state.result} context={state.context ?? {}} />;
}

// S2 응답에는 잎 자리(position)가 없어서 T3 로 찾아 가지를 정해요.
function GoToBranch({ result, context }) {
  const navigate = useNavigate();

  useEffect(() => {
    const treeId = context.treeId;
    getTree(treeId)
      .then((tree) => {
        const leaf = tree.leaves.find((l) => l.leafId === result.leaf?.leafId);
        const branchIndex = leaf ? branchOf(leaf.position) : 0;
        navigate(ROUTES.BRANCH(treeId, branchIndex), { replace: true, state: { result, context } });
      })
      .catch(() => navigate(ROUTES.TREE(treeId), { replace: true }));
  }, [context, navigate, result]);

  return <Loading message="잎을 붙일 자리를 찾고 있어요" />;
}
