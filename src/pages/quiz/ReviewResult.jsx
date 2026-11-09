import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import { PlayIcon } from '@/components/common/Icons';
import useApi from '@/hooks/useApi';
import useStartReview from '@/pages/review/useStartReview';
import { getReviews } from '@/apis/review';
import { ROUTES } from '@/constants/routes';
import { GRADE, GRADE_INFO } from '@/constants/study';
import { formatMonthDay } from '@/utils/date';

// 복습 결과 (시안: "잎이 되살아났어요!" / "조금 아쉬워요")
export default function ReviewResult({ result, context }) {
  const navigate = useNavigate();
  const { startReview, startingLeafId } = useStartReview();
  const { data: remaining } = useApi(() => getReviews(), []); // 남은 복습 잎

  const before = context.grade ?? GRADE.AUTUMN;
  const success = result.grade === GRADE.GREEN || result.correctCount === 3;
  const after = success ? GRADE.GREEN : before;
  const nextReview = remaining?.reviews?.[0];
  const topics = success
    ? (result.feedback?.strengths ?? [])
    : (result.feedback?.weaknesses ?? []);

  return (
    <section className="flex flex-1 items-center bg-black/30 px-4">
      <div className="w-full rounded-2xl bg-surface p-4">
        <div className="flex items-center justify-center gap-4 py-4">
          <LeafWithLabel grade={before} />
          <div className="flex gap-3 pb-6 text-ink-3">
            <PlayIcon />
            <PlayIcon />
            <PlayIcon />
          </div>
          <LeafWithLabel grade={after} strong />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-ink">{success ? '잎이 되살아났어요!' : '조금 아쉬워요'}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {success ? (
            <>
              복습 3문제를 모두 맞혔어요.
              <br />
              {formatMonthDay(context.studiedAt)} 잎이 싱싱한 잎으로 바뀌었어요.
            </>
          ) : (
            <>
              3문제를 모두 맞혀야 싱싱한 잎이 돼요.
              <br />이 잎은 1일 뒤 다시 복습할 수 있어요.
            </>
          )}
        </p>

        {topics.length > 0 && (
          <div className="mt-6 rounded-2xl bg-subtle p-4">
            <p className="text-base font-semibold text-ink">{success ? '이제 잘 이해한 부분' : '한 번 더 볼 부분'}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-2">
              {topics.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-sm text-ink-3">
          {success
            ? `남은 복습 잎 ${remaining?.reviews?.length ?? 0}개`
            : result.nextReviewAt && `다음 복습: ${formatMonthDay(result.nextReviewAt)}`}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {success && nextReview && (
            <Button onClick={() => startReview(nextReview)} disabled={startingLeafId !== null}>
              다음 잎 복습하기
            </Button>
          )}
          <Button
            variant={success && nextReview ? 'secondary' : 'primary'}
            onClick={() => navigate(ROUTES.REVIEW, { replace: true })}
          >
            복습 목록으로
          </Button>
        </div>
      </div>
    </section>
  );
}

function LeafWithLabel({ grade, strong = false }) {
  return (
    <div className="flex w-20 flex-col items-center gap-2">
      <Leaf grade={grade} className="size-14" />
      <span className={`text-sm ${strong ? 'font-semibold text-ink' : 'text-ink-3'}`}>{GRADE_INFO[grade]?.label}</span>
    </div>
  );
}
