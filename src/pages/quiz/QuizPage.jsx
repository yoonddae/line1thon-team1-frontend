import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Loading, { ErrorState } from '@/components/common/Loading';
import Modal, { ModalActions, ModalText, ModalTitle } from '@/components/common/Modal';
import { getQuizSet, submitAnswers } from '@/apis/study';
import { isInProgressError } from '@/apis/client';
import { ROUTES } from '@/constants/routes';
import { DIFFICULTY_LABEL, QUESTION_TYPE, QUIZ_SET_TYPE } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';

const TITLE = {
  [QUIZ_SET_TYPE.INITIAL]: '문제 풀기',
  [QUIZ_SET_TYPE.RETRY]: '다시 도전',
  [QUIZ_SET_TYPE.REVIEW]: '복습',
};

// 문제 풀기 (첫 풀이 7문제 · 잎눈 재도전 7문제 · 복습 3문제 공용)
// 답은 제출(S2) 때 한 번에 보내요. 나갔다 오면 같은 문제를 1번부터 다시 풀어요(S4).
export default function QuizPage() {
  const { quizSetId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const passedContext = state?.context ?? {};

  const [quizSet, setQuizSet] = useState(state?.quizSet ?? null);
  const [loadError, setLoadError] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);

  // 새로고침 등으로 state 가 없으면 S4 로 다시 받아요.
  useEffect(() => {
    if (quizSet) return;
    getQuizSet(quizSetId).then(setQuizSet).catch(setLoadError);
  }, [quizSet, quizSetId]);

  // 문제 세트 응답에 treeId·subjectName·studyId 가 있어서 화면 간 정보는 여기서 채워요.
  const context = {
    ...passedContext,
    treeId: quizSet?.treeId ?? passedContext.treeId,
    subjectName: quizSet?.subjectName ?? passedContext.subjectName,
    studyId: quizSet?.studyId ?? passedContext.studyId,
  };

  if (loadError) return <ErrorState message={getErrorMessage(loadError)} onRetry={() => navigate(0)} />;
  if (!quizSet) return <Loading />;

  const questions = [...quizSet.questions].sort((a, b) => a.number - b.number);
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const isMultiple = question.questionType === QUESTION_TYPE.MULTIPLE_CHOICE;
  const unansweredMultiple = questions.filter(
    (q) => q.questionType === QUESTION_TYPE.MULTIPLE_CHOICE && answers[q.questionId] === undefined,
  );

  const setAnswer = (value) => setAnswers((prev) => ({ ...prev, [question.questionId]: value }));

  const handleSubmit = async () => {
    if (submitting) return;
    if (unansweredMultiple.length) {
      setIndex(questions.indexOf(unansweredMultiple[0]));
      setSubmitError('객관식 문제에 모두 답해 주세요');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = questions.map((q) =>
        q.questionType === QUESTION_TYPE.MULTIPLE_CHOICE
          ? { questionId: q.questionId, selectedIndex: answers[q.questionId] }
          : { questionId: q.questionId, essayText: answers[q.questionId] ?? '' },
      );
      const result = await submitAnswers(quizSet.quizSetId, payload);
      navigate(ROUTES.QUIZ_RESULT(quizSet.quizSetId), {
        replace: true,
        state: { result, quizSetType: quizSet.quizSetType, context },
      });
    } catch (err) {
      if (!isInProgressError(err)) setSubmitError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-1 flex-col pb-8">
      <PageHeader
        title={TITLE[quizSet.quizSetType] ?? '문제 풀기'}
        subtitle={context.subjectName ? `${context.subjectName} 나무` : undefined}
        onBack={() => setLeaveOpen(true)}
      />

      <div className="px-4">
        <div className="flex items-center justify-between text-sm text-ink-3">
          <span>
            <b className="text-ink">{index + 1}</b> / {questions.length}
          </span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs">
            {DIFFICULTY_LABEL[question.difficulty] ?? ''}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-primary transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-4 pt-6">
        {question.topic && <p className="text-xs text-ink-3">{question.topic}</p>}
        <p className="-mt-3 text-lg leading-relaxed font-semibold whitespace-pre-line text-ink">{question.content}</p>

        {isMultiple ? (
          <ul className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              const selected = answers[question.questionId] === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setAnswer(i)}
                    className={`flex w-full items-start gap-3 rounded-xl p-4 text-left text-sm ${
                      selected ? 'border-[1.5px] border-primary bg-primary-soft text-ink' : 'bg-surface text-ink-2'
                    }`}
                  >
                    <span className={`font-semibold ${selected ? 'text-primary' : 'text-ink-4'}`}>{i + 1}</span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <textarea
            value={answers[question.questionId] ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답을 서술해 주세요"
            className="min-h-48 resize-none rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed outline-none placeholder:text-ink-4 focus:border-primary"
          />
        )}

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <div className="mt-auto flex gap-2 pt-4">
          {index > 0 && (
            <Button variant="secondary" className="w-1/3" onClick={() => setIndex((i) => i - 1)}>
              이전
            </Button>
          )}
          {isLast ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              제출하기
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => i + 1)} disabled={isMultiple && answers[question.questionId] === undefined}>
              다음
            </Button>
          )}
        </div>
      </div>

      {submitting && <Loading fullScreen message={'채점하고 있어요\n최대 1분 정도 걸릴 수 있어요'} />}

      <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)}>
        <ModalTitle>풀이를 멈출까요?</ModalTitle>
        <ModalText>{'고른 답은 저장되지 않아요.\n다시 오면 같은 문제를 1번부터 풀어요.'}</ModalText>
        <ModalActions>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            나가기
          </Button>
          <Button onClick={() => setLeaveOpen(false)}>계속 풀기</Button>
        </ModalActions>
      </Modal>
    </section>
  );
}
