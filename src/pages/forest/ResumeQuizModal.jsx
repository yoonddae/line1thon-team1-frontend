import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal, { ModalActions, ModalText, ModalTitle } from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { getQuizSet } from '@/apis/study';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/constants/messages';
import { formatMonthDay } from '@/utils/date';

// 7.2 이어 풀기: T3 pendingQuizSetId 가 있으면 띄워요. S4 로 같은 7문제를 1번부터 다시 받아요.
export default function ResumeQuizModal({ tree, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleResume = async () => {
    setLoading(true);
    try {
      const quizSet = await getQuizSet(tree.pendingQuizSetId);
      navigate(ROUTES.QUIZ(quizSet.quizSetId), {
        state: { quizSet, context: { treeId: tree.treeId, subjectName: tree.subjectName } },
      });
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={Boolean(tree)} onClose={onClose}>
      {tree && (
        <>
          <ModalTitle>풀던 문제가 있어요</ModalTitle>
          <p className="mt-2 text-sm text-ink-3">
            {tree.subjectName} 나무 · {formatMonthDay(tree.pendingStudiedAt)} 공부
          </p>
          <ModalText>{'나갔던 문제부터가 아니라,\n같은 7문제를 1번부터 다시 풀어요.'}</ModalText>
          <ModalActions>
            <Button onClick={handleResume} disabled={loading}>
              1번부터 다시 풀기
            </Button>
            <Button variant="secondary" onClick={onClose}>
              나중에 하기
            </Button>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}
