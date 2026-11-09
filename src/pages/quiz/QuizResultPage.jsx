import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import AdScreen from '@/components/common/AdScreen';
import Loading from '@/components/common/Loading';
import ReviewResult from './ReviewResult';
import FeedbackBox, { BulletList } from '@/components/common/FeedbackBox';
import { checkAd } from '@/apis/leaf';
import { retryStudy } from '@/apis/study';
import { isInProgressError } from '@/apis/client';
import { ROUTES } from '@/constants/routes';
import { AD_PLACEMENT, GRADE, GRADE_INFO, QUIZ_SET_TYPE } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';

// 채점 결과 (S2 응답). 복습이면 복습 결과, 아니면 잎 결과 → 나무에 붙이기(A1 → 광고 → 나무)
// ⚠️ S2 응답 명세를 아직 받지 못해 아래 필드를 가정했어요:
//    { correctCount, leafId, treeId, studyId, grade, feedback: { summary, strengths, weaknesses, essayFeedback }, nextReviewAt }
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
  const [showAd, setShowAd] = useState(false);
  const [busy, setBusy] = useState(false);

  const treeId = result.treeId ?? context.treeId;
  const grade = result.grade ?? GRADE.BUD;
  const info = GRADE_INFO[grade];
  const isBud = grade === GRADE.BUD;
  const goToTree = () => navigate(ROUTES.TREE(treeId), { replace: true });

  // 배치 팝업에서 닫기·다음을 누를 때 A1(LEAF_PLACEMENT)
  const handlePlace = async () => {
    setBusy(true);
    const ad = await checkAd(AD_PLACEMENT.LEAF_PLACEMENT);
    if (ad.showAd) setShowAd(true);
    else goToTree();
  };

  // 잎눈 재도전 (S3 → 새 7문제)
  const handleRetry = async () => {
    setBusy(true);
    try {
      const quizSet = await retryStudy(result.studyId);
      navigate(ROUTES.QUIZ(quizSet.quizSetId), { replace: true, state: { quizSet, context } });
    } catch (err) {
      if (!isInProgressError(err)) alert(getErrorMessage(err));
      setBusy(false);
    }
  };

  if (showAd) return <AdScreen onClose={goToTree} />;

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
