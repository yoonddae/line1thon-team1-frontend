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
  return <GradeResult result={state.result} context={state.context ?? {}} />;
}

function GradeResult({ result, context }) {
  const navigate = useNavigate();
  const [essayOpen, setEssayOpen] = useState(false);
  const [phase, setPhase] = useState('result'); // result | finding | fail
  const [error, setError] = useState(null);

  const { leaf, feedback = {}, correctCount, gradedCount = 6 } = result;
  const results = [...result.results].sort((a, b) => a.number - b.number);
  const reachedUntil = GRADE_SCALE.findIndex((s) => s.grade === leaf?.grade);

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
          <div className="absolute inset-x-3 top-9 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full bg-primary" style={{ width: `${(correctCount / gradedCount) * 100}%` }} />
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
              <li key={r.questionId} className="flex min-h-[57px] items-center justify-between gap-2 rounded-xl bg-surface p-4">
                <span className="flex min-w-0 flex-1 items-center gap-4">
                  {r.isCorrect ? <CheckCircleIcon /> : <CloseCircleIcon />}
                  <span className="sr-only">{r.isCorrect ? '정답' : '오답'}</span>
                  <span className="min-w-0 flex-1 text-lg leading-[1.4] font-medium text-ink-3">
                    {r.number}. {r.topic}
                  </span>
                </span>
                <span className="shrink-0 text-sm whitespace-nowrap text-ink-3">{DIFFICULTY_LABEL[r.difficulty]}</span>
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
