import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Loading, { ErrorState } from '@/components/common/Loading';
import TreeView, { branchOf } from '@/components/tree/TreeView';
import { skyGradient } from '@/components/tree/SkyBackground';
import useApi from '@/hooks/useApi';
import { getTree } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/constants/messages';

// 가지 확대: T3 leaves 를 position 으로 나눠 한 가지만 크게 그려요. 잎을 누르면 그날 기록(L2)
export default function BranchPage() {
  const { treeId, branchIndex } = useParams();
  const index = Number(branchIndex);
  const navigate = useNavigate();
  const { data: tree, loading, error, reload } = useApi(() => getTree(treeId), [treeId]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  const leaves = tree.leaves.filter((leaf) => branchOf(leaf.position) === index);

  return (
    <section className="flex flex-1 flex-col" style={{ background: skyGradient(tree.backgroundColor) }}>
      <PageHeader title={`${tree.subjectName} 나무 ${index + 1}번 가지`} subtitle={`잎 ${leaves.length}개`} />
      <div className="flex flex-1 items-center justify-center px-4">
        {leaves.length ? (
          <TreeView
            leaves={tree.leaves}
            branchIndex={index}
            onLeafClick={(leaf) => navigate(ROUTES.LEAF(leaf.leafId))}
            className="w-full"
          />
        ) : (
          <p className="text-sm text-ink-3">아직 이 가지에는 잎이 없어요</p>
        )}
      </div>
      {leaves.length > 0 && <p className="pb-8 text-center text-xs text-ink-4">잎을 누르면 그날 공부 기록을 볼 수 있어요</p>}
    </section>
  );
}
