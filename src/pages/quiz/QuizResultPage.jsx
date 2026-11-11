import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import Loading from '@/components/common/Loading';
import ReviewResult from './ReviewResult';
import FeedbackBox, { BulletList } from '@/components/common/FeedbackBox';
import { retryStudy } from '@/apis/study';
import { isInProgressError } from '@/apis/client';
import { ROUTES } from '@/constants/routes';
import { GRADE, GRADE_INFO, QUIZ_SET_TYPE } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';

// 채점 결과 (S2 응답). 복습이면 복습 결과, 아니면 잎 결과 → 나무에 붙이기(A8 잎 배치 완료로 이동)
// S2 응답 형식은 src/apis/study.js 주석 참고
export default function QuizResultPage() {
  const { state } = useLocation();
  if (!state?.result) return <Navigate to={ROUTES.FOREST} replace />;

  if (state.quizSetType === QUIZ_SET_TYPE.REVIEW) {
    return <ReviewResult result={state.result} context={state.context ?? {}} />;
  }
  return <LeafResult result={state.result} context={state.context ?? {}} />;
}

function LeafResult({ result, context }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const treeId = context.treeId;
  const grade = result.leaf?.grade ?? GRADE.BUD;
  const info = GRADE_INFO[grade];
  const isBud = grade === GRADE.BUD;

  // "나무에 붙이기" → A8 잎 배치 완료 (나무 화면에서 애니메이션 + 시트, 광고 확인은 시트에서)
  const handlePlace = () =>
    navigate(ROUTES.TREE(treeId), {
      replace: true,
      state: { placedLeaf: { leafId: result.leaf?.leafId, grade } }, // position 은 나무 화면이 T3 에서 찾아요
    });

  // 잎눈 재도전 (S3 → 새 7문제)
  const handleRetry = async () => {
    setBusy(true);
    try {
      const quizSet = await retryStudy(context.studyId);
      navigate(ROUTES.QUIZ(quizSet.quizSetId), { replace: true, state: { quizSet, context } });
    } catch (err) {
      if (!isInProgressError(err)) alert(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-1 flex-col px-4 pt-16 pb-8">
      <div className="flex flex-col items-center gap-3">
        <Leaf grade={grade} className="size-24" />
        <p className="mt-2 text-2xl font-semibold text-ink">{info.label}</p>
        <p className="text-sm text-ink-3">
          이번 문제 {result.correctCount ?? 0}/6 · {info.message}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {result.feedback?.summary ? (
          <FeedbackBox title="총평">{result.feedback.summary}</FeedbackBox>
        ) : (
          <FeedbackBox title="총평">채점은 완료됐어요. 피드백을 준비하고 있어요.</FeedbackBox>
        )}
        {result.feedback?.weaknesses?.length > 0 && (
          <FeedbackBox title="한 번 더 볼 부분">
            <BulletList items={result.feedback.weaknesses} />
          </FeedbackBox>
        )}
        {result.feedback?.essayFeedback && <FeedbackBox title="서술형 피드백">{result.feedback.essayFeedback}</FeedbackBox>}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        {isBud ? (
          <>
            <Button onClick={handleRetry} disabled={busy}>
              다시 도전하기
            </Button>
            <Button variant="secondary" onClick={handlePlace} disabled={busy}>
              잎눈으로 남기기
            </Button>
          </>
        ) : (
          <Button onClick={handlePlace} disabled={busy}>
            나무에 붙이기
          </Button>
        )}
      </div>

      {busy && isBud && <Loading fullScreen message="새 문제를 만들고 있어요" />}
    </section>
  );
}
