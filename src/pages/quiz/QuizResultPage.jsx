import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Leaf from '@/components/common/Leaf';
import { AiLoadingScreen, AiRetryScreen } from '@/components/study/AiStatus';
import { CheckCircleIcon, ChevronDownIcon, CloseCircleIcon } from '@/components/study/StudyIcons';
import ReviewResult from './ReviewResult';
import { branchOf } from '@/components/tree/TreeView';
import { getTree } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { DIFFICULTY_LABEL, GRADE, QUESTION_TYPE, QUIZ_SET_TYPE, STUDY_LEVEL_LABEL } from '@/constants/study';

// 채점 결과 진척도 그래프: 왼쪽 0개 → 오른쪽 6개
const GRADE_SCALE = [
  { grade: GRADE.BUD, range: '0' },
  { grade: GRADE.BROWN, range: '1' },
  { grade: GRADE.AUTUMN, range: '2~3' },
  { grade: GRADE.LIGHT_GREEN, range: '4~5' },
  { grade: GRADE.GREEN, range: '6' },
];

// 채점 결과 (S2 응답, 형식은 src/apis/study.js 주석 참고)
// - 복습: 복습 결과 모달 (A11)
// - 첫 풀이·재도전: 피그마 「디자인」 숲_공부 내용 입력_채점 결과 → "잎사귀 확인하기"
//   → 새 잎이 붙을 가지 확대 화면으로 이동해 결과 모달을 띄워요 (숲_나무에 잎 붙이기)
export default function QuizResultPage() {
  const { state } = useLocation();
  if (!state?.result) return <Navigate to={ROUTES.FOREST} replace />;

  if (state.quizSetType === QUIZ_SET_TYPE.REVIEW) {
    return <ReviewResult result={state.result} context={state.context ?? {}} />;
  }
  return <GradeResult result={state.result} context={state.context ?? {}} questions={state.questions ?? []} />;
}

function GradeResult({ result, context, questions }) {
  const navigate = useNavigate();
  const [essayOpen, setEssayOpen] = useState(false);
  const [openId, setOpenId] = useState(null); // 정답을 펼쳐 본 객관식 문제
  const [phase, setPhase] = useState('result'); // result | finding | fail
  const [error, setError] = useState(null);

  const { leaf, feedback = {}, correctCount, gradedCount = 6 } = result;
  const results = [...result.results].sort((a, b) => a.number - b.number);
  const reachedUntil = GRADE_SCALE.findIndex((s) => s.grade === leaf?.grade);
  // 잎 표시 5개가 같은 간격(0·25·50·75·100%)이라, 막대도 맞힌 개수 비율이 아니라 받은 등급 위치까지 채워요.
  // (예: 2/6 → 단풍잎. 개수 비율 33% 로 채우면 마른 잎까지만 찬 것처럼 보였어요)
  const progress = reachedUntil < 0 ? 0 : (reachedUntil / (GRADE_SCALE.length - 1)) * 100;

  // S2 응답에는 잎 자리(position)가 없어서 T3 로 찾아 가지를 정해요.
  const goToBranch = async () => {
    setPhase('finding');
    try {
      const tree = await getTree(context.treeId);
      const placed = tree.leaves.find((l) => l.leafId === leaf?.leafId);
      const branchIndex = placed ? branchOf(placed.position) : 0;
      navigate(ROUTES.BRANCH(context.treeId, branchIndex), { replace: true, state: { result, context } });
    } catch (err) {
      setError(err);
      setPhase('fail');
    }
  };

  if (phase === 'finding') return <AiLoadingScreen message="잎을 붙일 자리를 찾고 있어요" />;
  if (phase === 'fail') return <AiRetryScreen error={error} onRetry={goToBranch} onClose={() => setPhase('result')} />;

  return (
    <section className="flex flex-1 flex-col bg-subtle">
      <div className="flex flex-1 flex-col gap-9 px-4 pt-9 pb-6">
        <div>
          <p className="text-sm leading-[1.4] text-ink-3">
            {context.subjectName}
            {context.studyLevel && ` · ${STUDY_LEVEL_LABEL[context.studyLevel]}`}
          </p>
          <h1 className="text-2xl leading-[1.4] font-medium text-ink-2">
            채점 결과: {correctCount}/{gradedCount}
          </h1>
        </div>

        {/* 진척도 그래프: 잎눈(0) · 마른 잎(1) · 단풍잎(2~3) · 연두잎(4~5) · 싱싱한 잎(6) */}
        <div className="relative flex justify-between" aria-label={`맞힌 개수 ${correctCount}개`}>
          <div className="absolute inset-x-[15px] top-9 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          {GRADE_SCALE.map((s, i) => (
            <div key={s.grade} className="relative flex w-[30px] flex-col items-center gap-3">
              <Leaf grade={s.grade} className="h-5 w-4" />
              <span
                className={`size-3 rounded-full ${i <= reachedUntil ? 'border-[1.5px] border-primary bg-surface' : 'bg-line'}`}
                aria-hidden
              />
              <span className="-mt-1 text-sm leading-[1.4] whitespace-nowrap text-ink">{s.range}</span>
            </div>
          ))}
        </div>

        <ul className="flex flex-col gap-3">
          {results.map((r) =>
            r.questionType === QUESTION_TYPE.ESSAY ? (
              <li key={r.questionId} className="flex flex-col gap-3">
                <button
                  type="button"
                  aria-expanded={essayOpen}
                  onClick={() => setEssayOpen((v) => !v)}
                  className="flex min-h-[57px] w-full items-center justify-between gap-2 rounded-xl bg-surface p-4 text-left"
                >
                  <span className="min-w-0 flex-1 text-lg leading-[1.4] font-medium text-ink-3">{r.topic}</span>
                  <ChevronDownIcon className={`size-6 shrink-0 transition-transform ${essayOpen ? 'rotate-180' : ''}`} />
                </button>
                {essayOpen && (
                  <div className="min-h-[300px] rounded-xl border border-info bg-surface p-4 text-sm leading-[1.4] whitespace-pre-wrap text-ink-2">
                    {feedback.essayFeedback}
                  </div>
                )}
              </li>
            ) : (
              <li key={r.questionId} className="flex flex-col gap-3">
                {/* 누르면 문제·보기와 정답·내 답·해설을 펼쳐 봐요 */}
                <button
                  type="button"
                  aria-expanded={openId === r.questionId}
                  onClick={() => setOpenId((id) => (id === r.questionId ? null : r.questionId))}
                  className="flex min-h-[57px] w-full items-center justify-between gap-2 rounded-xl bg-surface p-4 text-left"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-4">
                    {r.isCorrect ? <CheckCircleIcon /> : <CloseCircleIcon />}
                    <span className="sr-only">{r.isCorrect ? '정답' : '오답'}</span>
                    <span className="min-w-0 flex-1 text-lg leading-[1.4] font-medium text-ink-3">
                      {r.number}. {r.topic}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap text-ink-3">
                    {DIFFICULTY_LABEL[r.difficulty]}
                    <ChevronDownIcon className={`size-5 shrink-0 transition-transform ${openId === r.questionId ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {openId === r.questionId && (
                  <AnswerDetail result={r} question={questions.find((q) => q.questionId === r.questionId)} />
                )}
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="sticky bottom-0 bg-subtle px-4 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <Button onClick={goToBranch}>잎사귀 확인하기</Button>
      </div>
    </section>
  );
}

// 객관식 한 문제의 보기 · 정답 · 내 답 · 해설 (S2 결과의 answerIndex · selectedIndex · explanation)
function AnswerDetail({ result, question }) {
  const options = question?.options ?? [];
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-info bg-surface p-4 text-sm leading-[1.4] text-ink-2">
      {question?.content && <p className="font-medium whitespace-pre-line text-ink">{question.content}</p>}
      {options.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {options.map((option, i) => {
            const isAnswer = i === result.answerIndex;
            const isMine = i === result.selectedIndex;
            return (
              <li
                key={i}
                className={`rounded-lg border px-3 py-2 ${
                  isAnswer
                    ? 'border-primary bg-primary-soft font-semibold text-ink'
                    : isMine
                      ? 'border-transparent bg-danger/10 text-danger'
                      : 'border-transparent text-ink-3'
                }`}
              >
                {i + 1}. {option}
                {isAnswer && <span className="text-primary"> (정답)</span>}
                {isMine && !isAnswer && ' (내 답)'}
                {isMine && isAnswer && <span className="text-primary"> · 내 답</span>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>
          정답: {result.answerIndex + 1}번
          {result.selectedIndex != null && !result.isCorrect && ` · 내 답: ${result.selectedIndex + 1}번`}
        </p>
      )}
      {result.explanation && <p className="text-ink-3">해설: {result.explanation}</p>}
    </div>
  );
}
