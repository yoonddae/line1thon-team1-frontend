import { useState } from 'react';
import useApi from '@/hooks/useApi';
import { getTreeReviews } from '@/apis/review';
import ReviewItem from '@/pages/review/ReviewItem';
import useStartReview from '@/pages/review/useStartReview';

// 나무 화면 아래 "복습할 잎이 N개 있어요" 시트 (R1). 손잡이를 누르면 펼쳐져요.
export default function ReviewSheet({ treeId }) {
  const [open, setOpen] = useState(false);
  const { data } = useApi(() => getTreeReviews(treeId), [treeId]);
  const { startReview, startingLeafId } = useStartReview();
  const reviews = data?.reviews ?? [];

  if (!reviews.length) return null;

  return (
    <div className="fixed bottom-[72px] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 rounded-t-3xl bg-surface px-4 pb-4 shadow-[0_-4px_16px_rgba(42,41,38,0.08)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col items-start pt-2 text-left"
        aria-expanded={open}
      >
        <span className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <span className="text-base font-semibold text-ink">복습할 잎이 {reviews.length}개 있어요</span>
        <span className="mt-1 text-sm text-ink-3">복습 3문제를 모두 맞히면 싱싱한 잎을 얻어요</span>
      </button>
      {open && (
        <ul className="mt-4 flex max-h-[40vh] flex-col gap-2 overflow-y-auto">
          {reviews.map((review) => (
            <li key={review.leafId}>
              <ReviewItem
                review={review}
                tone="subtle"
                disabled={startingLeafId !== null}
                loading={startingLeafId === review.leafId}
                onClick={() => startReview(review, data.subjectName)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
