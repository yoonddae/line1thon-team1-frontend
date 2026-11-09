import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Loading, { ErrorState } from '@/components/common/Loading';
import { KebabIcon } from '@/components/common/Icons';
import TreeView from '@/components/tree/TreeView';
import { skyGradient } from '@/components/tree/SkyBackground';
import ResumeQuizModal from '@/pages/forest/ResumeQuizModal';
import DeleteTreeModal from './DeleteTreeModal';
import ReviewSheet from './ReviewSheet';
import useApi from '@/hooks/useApi';
import { getTree } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { MAX_LEAVES, STUDY_LEVEL_LABEL } from '@/constants/study';
import { ERROR_MESSAGES, getErrorMessage } from '@/constants/messages';

// 나무 화면 (T3): 가지를 누르면 확대, ⋮ 메뉴에서 수정·삭제, 복습할 잎이 있으면 아래 시트
export default function TreeDetailPage() {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);

  const { data: tree, loading, error, reload } = useApi(() => getTree(treeId), [treeId]);

  if (loading) return <Loading />;
  if (error) {
    if (error.code === 'TREE_NOT_FOUND') return <Navigate to={ROUTES.FOREST} replace />;
    return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;
  }

  const handleStudy = () => {
    if (tree.pendingQuizSetId) setResumeOpen(true);
    else if (tree.leafCount >= MAX_LEAVES) alert(ERROR_MESSAGES.TREE_FULL);
    else navigate(ROUTES.STUDY(treeId));
  };

  return (
    <section className="flex flex-1 flex-col" style={{ background: skyGradient(tree.backgroundColor) }}>
      <PageHeader
        title={`${tree.subjectName} 나무`}
        subtitle={`${STUDY_LEVEL_LABEL[tree.studyLevel] ?? ''} · 잎 ${tree.leafCount}개`}
        onBack={() => navigate(ROUTES.FOREST)}
        right={
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="나무 메뉴" className="p-1 text-ink-2">
            <KebabIcon />
          </button>
        }
      />

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} role="presentation" />
          <ul className="absolute top-16 right-4 z-20 w-20 overflow-hidden rounded bg-surface text-sm shadow-md">
            <li>
              <button type="button" className="h-9 w-full text-ink-2" onClick={() => navigate(ROUTES.TREE_EDIT(treeId))}>
                나무 수정
              </button>
            </li>
            <li>
              <button
                type="button"
                className="h-9 w-full text-danger"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              >
                나무 삭제
              </button>
            </li>
          </ul>
        </>
      )}

      <div className="flex flex-1 items-center justify-center px-2">
        <TreeView
          leaves={tree.leaves}
          onBranchClick={(branchIndex) => navigate(ROUTES.BRANCH(treeId, branchIndex))}
          className="w-full"
        />
      </div>
      <p className="text-center text-xs text-ink-4">가지를 누르면 잎을 크게 볼 수 있어요</p>

      <div className={`px-4 pt-4 ${tree.reviewPendingCount > 0 ? 'pb-32' : 'pb-6'}`}>
        <Button onClick={handleStudy}>공부 내용 입력하기</Button>
      </div>

      {tree.reviewPendingCount > 0 && <ReviewSheet treeId={treeId} />}

      <DeleteTreeModal tree={deleteOpen ? tree : null} onClose={() => setDeleteOpen(false)} />
      <ResumeQuizModal tree={resumeOpen ? tree : null} onClose={() => setResumeOpen(false)} />
    </section>
  );
}
