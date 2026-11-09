import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal, { ModalActions, ModalText, ModalTitle } from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { deleteTree, getTrees } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/constants/messages';

// 7.6 / T5 나무 삭제 확인
export default function DeleteTreeModal({ tree, onClose }) {
  const navigate = useNavigate();
  const [forest, setForest] = useState(null);
  const [loading, setLoading] = useState(false);

  // "삭제 후 무료 나무 2 / 3 사용 중" 표시용
  useEffect(() => {
    if (tree) getTrees().then(setForest).catch(() => setForest(null));
  }, [tree]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTree(tree.treeId);
      navigate(ROUTES.FOREST, { replace: true });
    } catch (err) {
      alert(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Modal open={Boolean(tree)} onClose={onClose}>
      {tree && (
        <>
          <ModalTitle>{tree.subjectName} 나무를 삭제할까요?</ModalTitle>
          <ModalText>{`잎 ${tree.leafCount}개와 공부 기록, 복습 문제가\n모두 사라지고 되돌릴 수 없어요.`}</ModalText>
          <div className="mt-6 rounded-2xl bg-subtle p-4">
            <p className="text-base font-semibold text-ink">무료 나무 자리 1개가 돌아와요</p>
            {forest && (
              <p className="mt-2 text-sm text-ink-3">
                삭제 후 무료 나무 {Math.max(forest.treeCount - 1, 0)} / {forest.freeTreeLimit} 사용 중
              </p>
            )}
          </div>
          <ModalActions>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              삭제하기
            </Button>
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}
