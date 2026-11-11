import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Loading, { ErrorState } from '@/components/common/Loading';
import AdScreen from '@/components/common/AdScreen';
import TreeView, { branchOf } from '@/components/tree/TreeView';
import { skyGradient } from '@/components/tree/SkyBackground';
import LeafResultModal from './LeafResultModal';
import useApi from '@/hooks/useApi';
import { getTree } from '@/apis/tree';
import { checkAd } from '@/apis/leaf';
import { retryStudy } from '@/apis/study';
import { isInProgressError } from '@/apis/client';
import { ROUTES } from '@/constants/routes';
import { AD_PLACEMENT } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';

const GROW_MS = 1400; // 잎 자라는 애니메이션(지연 포함) 시간

/**
 * 가지 확대: T3 leaves 를 position 으로 나눠 한 가지만 크게 그려요. 잎을 누르면 그날 기록(L2)
 *
 * 잎 붙이기 (시안 #19·#20, 와이어프레임 A8):
 * 채점 결과가 state.result 로 오면 새 잎을 숨긴 채 결과 모달을 띄우고,
 * "나무에 붙이기"(잎눈은 "잎눈으로 남기기") → 새 잎이 자라남 → A1(LEAF_PLACEMENT) → 광고
 */
export default function BranchPage() {
  const { treeId, branchIndex } = useParams();
  const index = Number(branchIndex);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { data: tree, loading, error, reload } = useApi(() => getTree(treeId), [treeId]);

  const result = state?.result;
  const newLeafId = result?.leaf?.leafId;
  const [phase, setPhase] = useState(result ? 'result' : 'done'); // result → growing → (ad) → done
  const [busy, setBusy] = useState(false);

  // 새로고침해도 결과 모달이 다시 뜨지 않게 history state 를 비워요.
  const finish = () => {
    setPhase('done');
    navigate('.', { replace: true, state: null });
  };

  const handlePlace = () => {
    setPhase('growing');
    setTimeout(async () => {
      const ad = await checkAd(AD_PLACEMENT.LEAF_PLACEMENT);
      if (ad.showAd) setPhase('ad');
      else finish();
    }, GROW_MS);
  };

  // 잎눈 재도전 (S3 → 새 7문제)
  const handleRetry = async () => {
    setBusy(true);
    try {
      const context = state?.context ?? {};
      const quizSet = await retryStudy(context.studyId);
      navigate(ROUTES.QUIZ(quizSet.quizSetId), { replace: true, state: { quizSet, context } });
    } catch (err) {
      if (!isInProgressError(err)) alert(getErrorMessage(err));
      setBusy(false);
    }
  };

  if (phase === 'ad') return <AdScreen onClose={finish} />;
  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  // 결과 모달이 떠 있는 동안에는 새 잎을 아직 붙이지 않아요.
  const visibleLeaves = phase === 'result' ? tree.leaves.filter((leaf) => leaf.leafId !== newLeafId) : tree.leaves;
  const leaves = tree.leaves.filter((leaf) => branchOf(leaf.position) === index);
  const newPosition = phase === 'growing' ? tree.leaves.find((leaf) => leaf.leafId === newLeafId)?.position : undefined;

  return (
    <section className="flex flex-1 flex-col" style={{ background: skyGradient(tree.backgroundColor) }}>
      <PageHeader
        title={`${tree.subjectName} 나무 ${index + 1}번 가지`}
        subtitle={`잎 ${leaves.length}개`}
        onBack={() => navigate(ROUTES.TREE(treeId))}
      />
      <div className="flex flex-1 items-center justify-center px-4">
        {leaves.length ? (
          <TreeView
            leaves={visibleLeaves}
            branchIndex={index}
            newPosition={newPosition}
            onLeafClick={phase === 'done' ? (leaf) => navigate(ROUTES.LEAF(leaf.leafId)) : undefined}
            className="w-full"
          />
        ) : (
          <p className="text-sm text-ink-3">아직 이 가지에는 잎이 없어요</p>
        )}
      </div>

      {phase === 'result' && (
        <LeafResultModal result={result} onPlace={handlePlace} onRetry={handleRetry} busy={busy} />
      )}
      {busy && <Loading fullScreen message="새 문제를 만들고 있어요" />}
    </section>
  );
}
