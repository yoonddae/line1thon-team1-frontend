import { useState } from 'react';
import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import AdScreen from '@/components/common/AdScreen';
import { checkAd } from '@/apis/leaf';
import { AD_PLACEMENT, GRADE_INFO } from '@/constants/study';

/**
 * A8 잎 배치 완료: 채점 결과의 "나무에 붙이기" 다음, 나무 화면 위에 뜨는 시트
 * 닫기·다음 → A1(LEAF_PLACEMENT) → showAd 면 A9 광고 → 나무 화면
 *
 * 채점 결과 화면에서 이렇게 넘어와요:
 *   navigate(ROUTES.TREE(treeId), { state: { placedLeaf: { leafId, position, grade } } })
 */
export default function LeafPlacedSheet({ subjectName, leaf, onDone }) {
  const [busy, setBusy] = useState(false);
  const [showAd, setShowAd] = useState(false);

  const handleClose = async () => {
    if (busy) return;
    setBusy(true);
    const ad = await checkAd(AD_PLACEMENT.LEAF_PLACEMENT);
    if (ad.showAd) setShowAd(true);
    else onDone();
  };

  if (showAd) return <AdScreen onClose={onDone} />;

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 rounded-t-3xl bg-surface px-4 pt-2 pb-8 shadow-[0_-4px_16px_rgba(42,41,38,0.1)]">
      <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line" />
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-subtle">
          <Leaf grade={leaf.grade} className="size-9" />
        </div>
        <div>
          <p className="text-lg leading-snug font-semibold text-ink">
            오늘 공부를 통해
            <br />
            잎사귀가 자라났습니다
          </p>
          <p className="mt-1 text-sm text-ink-3">
            {subjectName} 나무 · {leaf.position}번째 잎 · {GRADE_INFO[leaf.grade]?.label}
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={handleClose} disabled={busy}>
          닫기
        </Button>
        <Button onClick={handleClose} disabled={busy}>
          다음
        </Button>
      </div>
    </div>
  );
}
