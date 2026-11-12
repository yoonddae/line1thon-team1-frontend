import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiAlertModal, AiLoadingScreen, AiRetryScreen } from '@/components/study/AiStatus';
import { createReview } from '@/apis/review';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/constants/messages';
import { AI_ERROR_KIND, aiErrorKind } from '@/constants/aiError';
import { LOADING_MESSAGES } from '@/constants/loadingMessages';

/**
 * R2 복습 3문제 출제 → 문제 풀기 화면으로 이동
 * - 기다리는 동안 [긴 로딩] "복습할 문제를 준비하고 있어요" (약 5초)
 * - ① 다시 시도(AI 오류·시간 초과·인터넷 끊김) → 로딩 실패 화면, 같은 잎으로 다시 요청
 * - 그 밖의 오류(복습 시점 아님 등) → 안내 팝업, 두 번 누름(409) → 무시
 * 쓰는 화면에서 {reviewStatus} 를 그려 주세요.
 */
export default function useStartReview() {
  const navigate = useNavigate();
  const [startingLeafId, setStartingLeafId] = useState(null);
  const [failed, setFailed] = useState(null); // { review, subjectName, error }
  const [notice, setNotice] = useState(null);
  const sending = useRef(false);

  const startReview = async (review, subjectName = review.subjectName) => {
    if (sending.current) return;
    sending.current = true;
    setFailed(null);
    setStartingLeafId(review.leafId);
    try {
      const quizSet = await createReview(review.leafId);
      navigate(ROUTES.QUIZ(quizSet.quizSetId), {
        state: {
          quizSet,
          context: {
            treeId: review.treeId,
            subjectName,
            leafId: review.leafId,
            grade: review.grade,
            studiedAt: review.studiedAt,
          },
        },
      });
    } catch (err) {
      setStartingLeafId(null);
      const kind = aiErrorKind(err);
      if (kind === AI_ERROR_KIND.IGNORE) return;
      if (kind === AI_ERROR_KIND.RETRY) setFailed({ review, subjectName, error: err });
      else setNotice(err);
    } finally {
      sending.current = false;
    }
  };

  let reviewStatus = null;
  if (startingLeafId !== null) {
    reviewStatus = <AiLoadingScreen messages={LOADING_MESSAGES.REVIEW_START} />;
  } else if (failed) {
    reviewStatus = (
      <AiRetryScreen
        error={failed.error}
        onRetry={() => startReview(failed.review, failed.subjectName)}
        onClose={() => setFailed(null)}
      />
    );
  } else if (notice) {
    reviewStatus = <AiAlertModal message={getErrorMessage(notice)} error={notice} onClose={() => setNotice(null)} />;
  }

  return { startReview, startingLeafId, reviewStatus };
}
