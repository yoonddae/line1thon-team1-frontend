import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoHeader from '@/components/common/LogoHeader';
import Button from '@/components/common/Button';
import Loading, { ErrorState } from '@/components/common/Loading';
import TreeView from '@/components/tree/TreeView';
import { skyGradient } from '@/components/tree/SkyBackground';
import ResumeQuizModal from '@/pages/forest/ResumeQuizModal';
import useApi from '@/hooks/useApi';
import { getTree, getTrees } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { MAX_LEAVES } from '@/constants/study';
import { ERROR_MESSAGES, MESSAGES, getErrorMessage } from '@/constants/messages';
import { formatRelativeDay } from '@/utils/date';

// 숲 (T1): 나무 카드를 옆으로 넘겨 보고, 가운데 카드의 나무로 공부를 시작해요.
export default function ForestPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [details, setDetails] = useState({}); // treeId → T3 (카드에 실제 잎을 그리기 위해)
  const [resumeTree, setResumeTree] = useState(null);

  const { data, loading, error, reload } = useApi(() => getTrees(), []);
  const trees = data?.trees ?? [];
  const activeTree = trees[activeIndex];

  // 나무는 최대 3그루라 상세(T3)를 같이 불러 카드에 잎을 그려요.
  useEffect(() => {
    if (!trees.length) return;
    Promise.allSettled(trees.map((t) => getTree(t.treeId))).then((results) => {
      const next = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') next[trees[i].treeId] = r.value;
      });
      setDetails(next);
    });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth ?? 1;
    setActiveIndex(Math.round(el.scrollLeft / (cardWidth + 16)));
  };

  const handleStudy = async () => {
    if (!activeTree) return;
    if (activeTree.leafCount >= MAX_LEAVES) {
      alert(ERROR_MESSAGES.TREE_FULL);
      return;
    }
    try {
      const detail = details[activeTree.treeId] ?? (await getTree(activeTree.treeId));
      if (detail.pendingQuizSetId) setResumeTree(detail);
      else navigate(ROUTES.STUDY(activeTree.treeId));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleAddTree = () => {
    if (data?.canAddFreeTree) navigate(ROUTES.TREE_CREATE);
    else alert(MESSAGES.TREE_PURCHASE_SOON);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <section className="flex flex-1 flex-col">
      <LogoHeader />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-8 pb-2"
      >
        {trees.map((tree) => (
          <button
            key={tree.treeId}
            type="button"
            onClick={() => navigate(ROUTES.TREE(tree.treeId))}
            className="relative flex h-[480px] w-[327px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border-2 border-white text-left"
            style={{ background: skyGradient(tree.backgroundColor) }}
          >
            {tree.reviewPendingCount > 0 && (
              <span className="absolute top-6 right-6 rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white">
                복습 {tree.reviewPendingCount}
              </span>
            )}
            <div className="flex flex-1 items-end justify-center px-6 pt-16">
              <TreeView leaves={details[tree.treeId]?.leaves} className="w-full" />
            </div>
            <div className="px-6 pt-4 pb-6">
              <p className="text-2xl font-semibold text-ink">{tree.subjectName}</p>
              <p className="mt-1 text-sm text-ink-3">
                잎 {tree.leafCount}개 · {formatRelativeDay(tree.lastStudiedAt)}
              </p>
            </div>
          </button>
        ))}

        {/* 시안 Card/Add */}
        <button
          type="button"
          onClick={handleAddTree}
          className="relative flex h-[480px] w-[327px] shrink-0 snap-center flex-col justify-end rounded-3xl bg-surface p-6 text-left"
        >
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-extralight text-ink-2">+</span>
          <span className="text-2xl font-semibold text-ink">나무 추가</span>
          <span className="mt-1 text-sm text-ink-3">
            무료 나무 {data?.treeCount ?? 0}/{data?.freeTreeLimit ?? 3}
          </span>
        </button>
      </div>

      <div className="mt-auto px-4 pt-4 pb-6">
        {activeTree ? (
          <Button onClick={handleStudy}>공부 내용 입력하기</Button>
        ) : (
          <Button onClick={handleAddTree}>첫 나무 심기</Button>
        )}
      </div>

      <ResumeQuizModal tree={resumeTree} onClose={() => setResumeTree(null)} />
    </section>
  );
}
