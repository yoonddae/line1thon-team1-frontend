import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import { GRADE, GRADE_INFO, isReviewTarget } from '@/constants/study';

// 피그마 「디자인」 숲_나무에 잎 붙이기 / _잎눈(0점) (Modal/LeafResult): 가지 확대 화면 위에 뜨는 채점 결과
// 잎눈이 아니면 문구는 S2 feedback.summary(AI 가 쓴 한 줄 평)를 그대로 보여줘요.
const BUD_COPY = '오늘은 아쉬웠지만 공부한 기록은 남았어요.\n같은 내용으로 다시 도전하거나, 잎눈 그대로 남길 수 있어요.';

export default function LeafResultModal({ result, onPlace, onRetry, busy }) {
  const grade = result.leaf?.grade ?? GRADE.BUD;
  const isBud = grade === GRADE.BUD;
  const label = GRADE_INFO[grade].label;
  const strengths = result.feedback?.strengths ?? [];
  const weaknesses = result.feedback?.weaknesses ?? [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${label}${josaIGa(label)} 자라났어요`}
        className="flex max-h-full w-full max-w-[358px] flex-col gap-9 rounded-2xl bg-surface px-4 py-6 drop-shadow-[0_6px_10px_rgba(42,41,38,0.1)]"
      >
        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h2 className="flex items-center gap-1 text-lg leading-[1.4] font-semibold text-ink">
              {label}
              {josaIGa(label)} 자라났어요
              <Leaf grade={grade} className="h-5 w-4 shrink-0" />
            </h2>
            <p className="text-sm leading-[1.4] whitespace-pre-line text-ink-3">
              {isBud ? BUD_COPY : result.feedback?.summary}
            </p>
          </div>

          {(strengths.length > 0 || weaknesses.length > 0) && (
            <div className="flex flex-col gap-3">
              {!isBud && strengths.length > 0 && <TopicBox title="잘 이해한 부분" items={strengths} />}
              {weaknesses.length > 0 && <TopicBox title={isBud ? '먼저 다시 볼 부분' : '더 공부할 부분'} items={weaknesses} />}
            </div>
          )}

          {isReviewTarget(grade) && (
            <p className="text-sm leading-[1.4] text-ink-3">* 3일 뒤 복습 3문제를 모두 맞히면 싱싱한 잎으로 바뀌어요</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {isBud ? (
            <>
              <Button onClick={onRetry} disabled={busy}>
                다시 도전하기
              </Button>
              <Button variant="secondary" className="font-normal" onClick={onPlace} disabled={busy}>
                잎눈으로 남기기
              </Button>
            </>
          ) : (
            <Button onClick={onPlace} disabled={busy}>
              나무에 붙이기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicBox({ title, items }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-subtle p-4">
      <p className="text-base leading-[1.4] font-semibold text-ink-2">{title}</p>
      <ul className="text-sm leading-[1.4] text-ink-3">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

// 받침 유무로 '이/가' (단풍잎이 · 마른 잎이 · 잎눈이)
function josaIGa(word) {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return '가';
  return (code - 0xac00) % 28 ? '이' : '가';
}
