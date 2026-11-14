import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import Loading, { ErrorState } from '@/components/common/Loading';
import Modal, { ModalActions, ModalText, ModalTitle } from '@/components/common/Modal';
import { KebabIcon } from '@/components/common/Icons';
import StudyHeader from '@/components/study/StudyHeader';
import { AiAlertModal, AiRetryScreen, AiShortLoading } from '@/components/study/AiStatus';
import { getQuizSet, submitAnswers } from '@/apis/study';
import { ROUTES } from '@/constants/routes';
import { DIFFICULTY_LABEL, QUESTION_TYPE, QUIZ_SET_TYPE } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';
import { AI_ERROR_KIND, aiErrorKind } from '@/constants/aiError';
import { LOADING_MESSAGES } from '@/constants/loadingMessages';

const MAX_ESSAY = 1000;

// 문제 풀기 (피그마 「디자인」 숲_공부 내용 입력_퀴즈 객관식 / _퀴즈 서술형)
// 첫 풀이 7문제 · 잎눈 재도전 7문제 · 복습 3문제 공용. 답은 채점(S2) 때 한 번에 보내요.
// 나갔다 오면 같은 문제를 1번부터 다시 풀어요(S4). 채점이 실패해도 고른 답은 그대로 남아 같은 답으로 다시 보내요.
export default function QuizPage() {
  const { quizSetId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const passedContext = state?.context ?? {};

  const [quizSet, setQuizSet] = useState(state?.quizSet ?? null);
  const [loadError, setLoadError] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('solve'); // solve | grading | retry
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const sending = useRef(false);

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
    studyLevel: quizSet?.studyLevel ?? passedContext.studyLevel,
  };

  if (loadError) return <ErrorState message={getErrorMessage(loadError)} onRetry={() => navigate(0)} />;
  if (!quizSet) return <Loading />;

  const questions = [...quizSet.questions].sort((a, b) => a.number - b.number);
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const isMultiple = question.questionType === QUESTION_TYPE.MULTIPLE_CHOICE;
  const isReview = quizSet.quizSetType === QUIZ_SET_TYPE.REVIEW;
  const answered = answers[question.questionId] !== undefined;

  const setAnswer = (value) => setAnswers((prev) => ({ ...prev, [question.questionId]: value }));

  const handleSubmit = async () => {
    if (sending.current) return;
    const unanswered = questions.find(
      (q) => q.questionType === QUESTION_TYPE.MULTIPLE_CHOICE && answers[q.questionId] === undefined,
    );
    if (unanswered) {
      setIndex(questions.indexOf(unanswered));
      return;
    }
    sending.current = true;
    setPhase('grading');
    try {
      const payload = questions.map((q) =>
        q.questionType === QUESTION_TYPE.MULTIPLE_CHOICE
          ? { questionId: q.questionId, selectedIndex: answers[q.questionId] }
          : { questionId: q.questionId, essayText: (answers[q.questionId] ?? '').trim() },
      );
      const result = await submitAnswers(quizSet.quizSetId, payload);
      navigate(ROUTES.QUIZ_RESULT(quizSet.quizSetId), {
        replace: true,
        // 채점 결과에서 문제·보기와 정답을 같이 보여주려고 문제도 넘겨요 (S2 결과엔 보기가 없어요)
        state: { result, quizSetType: quizSet.quizSetType, context, questions: quizSet.questions },
      });
    } catch (err) {
      const kind = aiErrorKind(err);
      if (kind === AI_ERROR_KIND.IGNORE) return setPhase('solve');
      if (['ALREADY_SUBMITTED', 'NOT_BUD_RESULT', 'QUIZ_SET_NOT_FOUND'].includes(err.code)) {
        return navigate(context.treeId ? ROUTES.TREE(context.treeId) : ROUTES.FOREST, { replace: true });
      }
      setError(err);
      if (kind === AI_ERROR_KIND.RETRY) return setPhase('retry');
      setPhase('solve');
      setAlert({ message: getErrorMessage(err), error: err });
    } finally {
      sending.current = false;
    }
  };

  if (phase === 'retry') return <AiRetryScreen error={error} onRetry={handleSubmit} onClose={() => setPhase('solve')} />;

  return (
    <section className="flex flex-1 flex-col bg-subtle">
      <StudyHeader
        title={`${context.subjectName ?? ''} · ${index + 1} / ${questions.length}`}
        onBack={() => (index > 0 ? setIndex((i) => i - 1) : setLeaveOpen(true))}
        right={<KebabIcon />}
      />
      <div className="mt-3 flex gap-2 px-4" aria-hidden>
        {questions.map((q, i) => (
          <span key={q.questionId} className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-line'}`} />
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-9 px-4 pt-9 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {isMultiple ? (
              <>
                <Tag>{DIFFICULTY_LABEL[question.difficulty] ?? ''}</Tag>
                <Tag>객관식</Tag>
              </>
            ) : (
              <Tag>서술형</Tag>
            )}
          </div>
          <p className="text-2xl leading-[1.4] font-medium whitespace-pre-line text-ink-2">{question.content}</p>
        </div>

        {isMultiple ? (
          <ul className="flex flex-col gap-3" role="radiogroup">
            {question.options.map((option, i) => {
              const selected = answers[question.questionId] === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswer(i)}
                    className={`w-full rounded-xl border-[1.5px] bg-surface p-4 text-left text-lg leading-[1.4] font-medium ${
                      selected ? 'border-primary text-ink-2' : 'border-transparent text-ink-3'
                    }`}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <textarea
            value={answers[question.questionId] ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={MAX_ESSAY}
            placeholder="답변을 입력하세요."
            aria-label="서술형 답변"
            className="h-[300px] resize-none rounded-xl border border-line bg-surface p-4 text-sm leading-[1.4] text-ink-2 outline-none placeholder:text-ink-4 focus:border-primary"
          />
        )}

        {!isReview && (
          <div className="rounded-xl bg-info p-4 text-sm leading-[1.4] text-ink-2">
            쉬움 2 · 보통 2 · 어려움 2 · 서술형 1문제예요.
            <br />
            서술형은 맞힌 개수에 들어가지 않고, AI 피드백만 받아요.
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-subtle px-4 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {isLast ? (
          <Button onClick={handleSubmit}>채점하기</Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)} disabled={isMultiple && !answered}>
            다음 문제
          </Button>
        )}
      </div>

      {/* [짧은 로딩] 채점하기: 지금 화면 위에 띄우고 버튼은 눌리지 않아요 */}
      {phase === 'grading' && (
        <AiShortLoading messages={isReview ? LOADING_MESSAGES.REVIEW_GRADING : LOADING_MESSAGES.GRADING} />
      )}
      <AiAlertModal message={alert?.message} error={alert?.error} onClose={() => setAlert(null)} />

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

function Tag({ children }) {
  return <span className="rounded-full bg-line px-3 py-2 text-xs leading-[1.1] font-semibold text-ink-2">{children}</span>;
}
