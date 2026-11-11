import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import { GRADE, GRADE_INFO, isReviewTarget } from '@/constants/study';

// 시안 #19·#20 "나무에 잎 붙이기": 가지 확대 화면 위에 뜨는 채점 결과
// 단풍잎 문구는 시안 그대로, 나머지 등급 문구는 같은 톤으로 맞췄어요.
const COPY = {
  [GRADE.GREEN]: '6문제를 모두 맞혔어요.\n완벽하게 이해했어요.',
  [GRADE.LIGHT_GREEN]: '잘 이해했어요.\n조금만 더 다지면 싱싱한 잎이 될 수 있어요.',
  [GRADE.AUTUMN]: '기본은 잘 잡혔어요.\n조금만 더 다지면 싱싱한 잎이 될 수 있어요.',
  [GRADE.BROWN]: '다시 공부가 필요해요.\n복습하면 싱싱한 잎으로 바꿀 수 있어요.',
  [GRADE.BUD]: '오늘은 아쉬웠지만 공부한 기록은 남았어요.\n같은 내용으로 다시 도전하거나, 잎눈 그대로 남길 수 있어요.',
};

export default function LeafResultModal({ result, onPlace, onRetry, busy }) {
  const grade = result.leaf?.grade ?? GRADE.BUD;
  const isBud = grade === GRADE.BUD;
  const strengths = result.feedback?.strengths ?? [];
  const weaknesses = result.feedback?.weaknesses ?? [];

  return (
    <Modal open>
      <h2 className="flex items-center gap-1.5 text-lg font-semibold text-ink">
        {GRADE_INFO[grade].label}이 자라났어요
        <Leaf grade={grade} className={isBud ? 'size-4' : 'size-5'} />
      </h2>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-3">{COPY[grade]}</p>

      <div className="mt-6 flex flex-col gap-3">
        {!isBud && strengths.length > 0 && <TopicBox title="잘 이해한 부분" items={strengths} />}
        {weaknesses.length > 0 && <TopicBox title={isBud ? '먼저 다시 볼 부분' : '더 공부할 부분'} items={weaknesses} />}
      </div>

      {isReviewTarget(grade) && (
        <p className="mt-4 text-xs text-ink-3">* 3일 뒤 복습 3문제를 모두 맞히면 싱싱한 잎으로 바뀌어요</p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {isBud ? (
          <>
            <Button onClick={onRetry} disabled={busy}>
              다시 도전하기
            </Button>
            <Button variant="secondary" onClick={onPlace} disabled={busy}>
              잎눈으로 남기기
            </Button>
          </>
        ) : (
          <Button onClick={onPlace} disabled={busy}>
            나무에 붙이기
          </Button>
        )}
      </div>
    </Modal>
  );
}

function TopicBox({ title, items }) {
  return (
    <div className="rounded-2xl bg-subtle p-4">
      <p className="text-base font-semibold text-ink">{title}</p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-2">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
