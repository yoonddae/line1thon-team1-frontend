import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReview } from '@/apis/review';
import { isInProgressError } from '@/apis/client';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/constants/messages';

// R2 복습 3문제 출제 → 문제 풀기 화면으로 이동
export default function useStartReview() {
  const navigate = useNavigate();
  const [startingLeafId, setStartingLeafId] = useState(null);

  const startReview = async (review, subjectName = review.subjectName) => {
    if (startingLeafId !== null) return;
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
      if (!isInProgressError(err)) alert(getErrorMessage(err));
      setStartingLeafId(null);
    }
  };

  return { startReview, startingLeafId };
}
