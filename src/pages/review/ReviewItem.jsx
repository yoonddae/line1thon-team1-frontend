import { ChevronRightIcon } from '@/components/common/Icons';
import { GRADE_INFO } from '@/constants/study';
import { formatMonthDay } from '@/utils/date';

const TONES = {
  white: 'bg-surface',
  subtle: 'bg-subtle',
  highlight: 'border-[1.5px] border-primary bg-primary-soft', // 다음에 복습할 첫 잎
};

// "10월 29일 · 단풍잎 / 판별식, 평행이동, 최댓값"
export default function ReviewItem({ review, tone = 'white', onClick, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left disabled:opacity-70 ${TONES[tone]}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">
          {formatMonthDay(review.studiedAt)} · {GRADE_INFO[review.grade]?.label}
        </p>
        <p className="mt-1 truncate text-xs text-ink-3">{review.weakTopics?.join(', ')}</p>
      </div>
      {loading ? (
        <span className="size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      ) : (
        <ChevronRightIcon className="size-5 text-ink-3" />
      )}
    </button>
  );
}
