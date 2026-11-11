import LogoHeader from '@/components/common/LogoHeader';
import Button from '@/components/common/Button';
import InfoBox from '@/components/common/InfoBox';
import Loading, { ErrorState } from '@/components/common/Loading';
import ReviewItem from './ReviewItem';
import useStartReview from './useStartReview';
import useApi from '@/hooks/useApi';
import { getReviews } from '@/apis/review';
import { getErrorMessage } from '@/constants/messages';
import { formatMonthDay } from '@/utils/date';

// 복습 탭 (R0): 나무별로 묶어 보여주고, "처음부터 복습하기"는 목록의 첫 잎부터 시작해요.
export default function ReviewPage() {
  const { data, loading, error, reload } = useApi(() => getReviews(), []);
  const { startReview, startingLeafId } = useStartReview();

  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  const reviews = data?.reviews ?? [];

  if (!reviews.length) {
    return (
      <section className="flex flex-1 flex-col">
        <LogoHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-1 pb-16 text-center">
          <p className="text-lg font-medium text-ink">
            {data?.nextReviewAt ? '지금 복습할 잎이 없어요' : '복습할 잎이 없어요'}
          </p>
          {data?.nextReviewAt && (
            <p className="text-sm text-ink-2">다음 복습: {formatMonthDay(data.nextReviewAt)}</p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-ink-3">
            단풍잎·마른 잎이 생기고 3일이 지나면
            <br />
            복습 문제가 이곳에 나타나요.
          </p>
        </div>
      </section>
    );
  }

  // 서버가 준 순서(오래된 공부부터)를 유지하며 나무별로 묶어요.
  const groups = [];
  reviews.forEach((review) => {
    let group = groups.find((g) => g.treeId === review.treeId);
    if (!group) {
      group = { treeId: review.treeId, subjectName: review.subjectName, items: [] };
      groups.push(group);
    }
    group.items.push(review);
  });
  const firstLeafId = reviews[0].leafId;

  return (
    <section className="flex flex-1 flex-col">
      <LogoHeader />
      <div className="flex flex-col gap-8 px-4 pt-4">
        {groups.map((group) => (
          <div key={group.treeId}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-2">{group.subjectName} 나무</h2>
              <span className="text-sm text-ink-3">{group.items.length}개</span>
            </div>
            <ul className="flex flex-col gap-3">
              {group.items.map((review) => (
                <li key={review.leafId}>
                  <ReviewItem
                    review={review}
                    tone={review.leafId === firstLeafId ? 'highlight' : 'white'}
                    disabled={startingLeafId !== null}
                    loading={startingLeafId === review.leafId}
                    onClick={() => startReview(review)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <InfoBox>
          잎 등급과 상관없이 복습은 항상 3문제예요. 모두 맞히면 싱싱한 잎이 되고, 틀리면 1일 뒤 다시
          복습해요.
        </InfoBox>
      </div>
      <div className="sticky bottom-[72px] mt-auto bg-bg px-4 pt-4 pb-6">
        <Button onClick={() => startReview(reviews[0])} disabled={startingLeafId !== null}>
          처음부터 복습하기
        </Button>
      </div>
      {startingLeafId !== null && <Loading fullScreen message="복습 문제를 만들고 있어요" />}
    </section>
  );
}
