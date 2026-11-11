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

const CARD_WIDTH = 300;
const CARD_GAP = 16;
const SIDE_SCALE = 260 / 300; // 옆 카드 크기 (시안 260×381)

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

  // 가운데에 온 카드 = 선택된 카드 (카드 폭 300 + 간격 16)
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP)));
  };

  // 옆 카드를 누르면 먼저 가운데로 가져오고, 가운데 카드를 누르면 열어요.
  const handleCardClick = (index, onOpen) => {
    if (index === activeIndex) {
      onOpen();
      return;
    }
    scrollRef.current?.scrollTo({ left: index * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' });
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

      {/*
        시안: 가운데 카드 300×440, 양옆 카드는 260×381 크기로 살짝 보여요.
        좌우 여백을 (화면폭 - 카드폭)/2 로 줘서 첫 카드·마지막 카드도 가운데에 올 수 있어요.
        나무가 없으면 "나무 추가" 카드 하나만 가운데에 보여요.
      */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory items-center overflow-x-auto py-4"
        style={{ gap: CARD_GAP, paddingInline: `calc(50% - ${CARD_WIDTH / 2}px)` }}
      >
        {trees.map((tree, index) => (
          <ForestCard
            key={tree.treeId}
            index={index}
            activeIndex={activeIndex}
            onClick={() => handleCardClick(index, () => navigate(ROUTES.TREE(tree.treeId)))}
            className="border-2 border-white"
            style={{ background: skyGradient(tree.backgroundColor) }}
          >
            {/* 시안 숲 카드(300×440) 기준 위치(테두리 2px 안쪽). 나무는 시안과 같은 크기(원본의 0.698배) */}
            <TreeView
              leaves={details[tree.treeId]?.leaves}
              className="absolute"
              style={{ left: 19, top: 51, width: 258 }}
            />
            {tree.reviewPendingCount > 0 && (
              <span className="absolute top-6 right-6 flex h-[29px] items-center rounded-full bg-danger px-3 text-sm font-semibold text-white">
                복습 {tree.reviewPendingCount}
              </span>
            )}
            <div className="absolute bottom-[26px] left-6">
              <p className="text-2xl leading-8 font-semibold text-ink">{tree.subjectName}</p>
              <p className="mt-0.5 text-sm leading-5 text-ink-3">
                잎 {tree.leafCount}개 · {formatRelativeDay(tree.lastStudiedAt)}
              </p>
            </div>
          </ForestCard>
        ))}

        {/* 시안 Card/Add: 나무 카드들 맨 뒤에 붙어요 */}
        <ForestCard
          index={trees.length}
          activeIndex={activeIndex}
          onClick={() => handleCardClick(trees.length, handleAddTree)}
          className="bg-surface"
        >
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-extralight text-ink-2">+</span>
          <span className="absolute bottom-7 left-[26px] flex flex-col">
            <span className="text-2xl leading-8 font-semibold text-ink">나무 추가</span>
            <span className="mt-0.5 text-sm leading-5 text-ink-3">
              무료 나무 {data?.treeCount ?? 0}/{data?.freeTreeLimit ?? 3}
            </span>
          </span>
        </ForestCard>
      </div>

      <div className="mt-auto px-4 pt-4 pb-6">
        {activeTree ? (
          <Button onClick={handleStudy}>공부 내용 입력하기</Button>
        ) : (
          <Button onClick={handleAddTree}>새 나무 심기</Button>
        )}
      </div>

      <ResumeQuizModal tree={resumeTree} onClose={() => setResumeTree(null)} />
    </section>
  );
}

// 숲 카드 한 장. 가운데가 아니면 작게 줄이고, 가운데 카드 쪽으로 붙여서 시안처럼 16px 간격이 보이게 해요.
function ForestCard({ index, activeIndex, onClick, className = '', style, children }) {
  const isActive = index === activeIndex;
  const origin = index < activeIndex ? 'right center' : 'left center';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive || undefined}
      className={`relative flex h-[440px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl text-left shadow-[0_6px_20px_rgba(42,41,38,0.1)] transition-transform duration-300 ${className}`}
      style={{
        ...style,
        width: CARD_WIDTH,
        transform: isActive ? 'none' : `scale(${SIDE_SCALE})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </button>
  );
}
