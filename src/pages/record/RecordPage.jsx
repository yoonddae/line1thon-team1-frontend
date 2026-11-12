import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Leaf from '@/components/common/Leaf';
import AdScreen from '@/components/common/AdScreen';
import FeedbackBox, { BulletList } from '@/components/common/FeedbackBox';
import Loading, { ErrorState } from '@/components/common/Loading';
import useApi from '@/hooks/useApi';
import { checkAd, getLeaf } from '@/apis/leaf';
import { AD_PLACEMENT, DIFFICULTY_LABEL, GRADE_INFO, QUESTION_TYPE, QUIZ_SET_TYPE } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';
import { formatMonthDay } from '@/utils/date';

const QUIZ_SET_LABEL = {
  [QUIZ_SET_TYPE.INITIAL]: '첫 풀이',
  [QUIZ_SET_TYPE.RETRY]: '재도전',
  [QUIZ_SET_TYPE.REVIEW]: '복습',
};

// 잎 상세 = 그날 공부 기록 (L2). 열 때 A1(RECORD_VIEW)로 광고 여부를 확인해요.
export default function RecordPage() {
  const { leafId } = useParams();
  const { data: leaf, loading, error, reload } = useApi(() => getLeaf(leafId), [leafId]);
  const [showAd, setShowAd] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    checkAd(AD_PLACEMENT.RECORD_VIEW).then((ad) => setShowAd(ad.showAd));
  }, [leafId]);

  if (showAd) return <AdScreen onClose={() => setShowAd(false)} />;
  if (loading) return <Loading />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  const questions = [...leaf.questions].sort((a, b) => a.number - b.number);
  const wrong = questions.filter((q) => q.questionType === QUESTION_TYPE.MULTIPLE_CHOICE && !q.isCorrect);
  const visible = showAll ? questions : wrong.slice(0, 2);
  const changed = leaf.grade !== leaf.originalGrade;

  return (
    <section className="flex flex-1 flex-col pb-10">
      <PageHeader title={`${formatMonthDay(leaf.studiedAt)} 공부 기록`} subtitle={`${leaf.subjectName} 나무`} />

      <div className="flex flex-col gap-4 px-4 pt-2">
        {/* 처음 결과 → 지금 잎 */}
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-4">
          <Leaf grade={leaf.grade} className="size-12 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-ink">
              첫 학습 {leaf.correctCount}/6 · {GRADE_INFO[leaf.originalGrade]?.label}
              {changed && ` → ${GRADE_INFO[leaf.grade]?.label}`}
            </p>
            {leaf.reviewed && <p className="mt-1 text-ink-3">{formatMonthDay(leaf.reviewedAt)} 복습 3/3 성공</p>}
          </div>
        </div>

        <FeedbackBox title="공부한 내용">
          {leaf.study?.imageUrls?.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {leaf.study.imageUrls.map((url) => (
                <NoteImage key={url} src={url} />
              ))}
            </div>
          )}
          {leaf.study?.content && <p className="whitespace-pre-line">{leaf.study.content}</p>}
          {leaf.study?.memo && <p className="text-ink-3">메모: {leaf.study.memo}</p>}
        </FeedbackBox>

        {leaf.feedback?.summary && <FeedbackBox title="총평">{leaf.feedback.summary}</FeedbackBox>}
        {leaf.feedback?.weaknesses?.length > 0 && (
          <FeedbackBox title="한 번 더 볼 부분">
            <BulletList items={leaf.feedback.weaknesses} />
          </FeedbackBox>
        )}

        <div>
          <h2 className="mb-3 px-1 text-base font-semibold text-ink-2">
            {showAll ? '7문제 모두' : wrong.length ? '틀린 문제' : '문제'}
          </h2>
          <ul className="flex flex-col gap-3">
            {visible.map((q) => (
              <QuestionReview key={q.number} question={q} essayFeedback={leaf.feedback?.essayFeedback} />
            ))}
          </ul>
          {!showAll && (
            <button type="button" onClick={() => setShowAll(true)} className="mt-3 h-11 w-full rounded-xl bg-info text-sm text-ink-2">
              7문제 모두 보기
            </button>
          )}
        </div>

        {leaf.quizSets?.length > 0 && (
          <FeedbackBox title="풀이 기록">
            <ul className="flex flex-col gap-1">
              {leaf.quizSets.map((set) => (
                <li key={set.quizSetId} className="flex justify-between">
                  <span>
                    {formatMonthDay(set.submittedAt)} {QUIZ_SET_LABEL[set.quizSetType]}
                  </span>
                  <span className="text-ink-3">
                    {set.correctCount}/{set.quizSetType === QUIZ_SET_TYPE.REVIEW ? 3 : 6}
                  </span>
                </li>
              ))}
            </ul>
          </FeedbackBox>
        )}
      </div>
    </section>
  );
}

function QuestionReview({ question, essayFeedback }) {
  const isEssay = question.questionType === QUESTION_TYPE.ESSAY;

  return (
    <li className="rounded-2xl bg-surface p-4 text-sm">
      <div className="flex items-center gap-2 text-xs text-ink-3">
        <span>{question.number}번</span>
        <span>{DIFFICULTY_LABEL[question.difficulty]}</span>
        {!isEssay && (
          <span className={question.isCorrect ? 'text-primary' : 'text-danger'}>{question.isCorrect ? '정답' : '오답'}</span>
        )}
      </div>
      <p className="mt-2 leading-relaxed font-medium whitespace-pre-line text-ink">{question.content}</p>

      {isEssay ? (
        essayFeedback && <p className="mt-3 rounded-lg bg-subtle p-3 leading-relaxed text-ink-2">{essayFeedback}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5">
          {question.options.map((option, i) => {
            const isAnswer = i === question.answerIndex;
            const isMine = i === question.selectedIndex;
            return (
              <li
                key={i}
                className={`rounded-lg px-3 py-2 ${
                  isAnswer ? 'bg-primary-soft text-ink' : isMine ? 'bg-danger/10 text-danger' : 'text-ink-3'
                }`}
              >
                {i + 1}. {option}
                {isMine && ' (내 답)'}
              </li>
            );
          })}
        </ul>
      )}
      {question.explanation && <p className="mt-3 text-ink-3">해설: {question.explanation}</p>}
    </li>
  );
}

// 아이폰 HEIC 사진처럼 브라우저가 못 여는 사진은 깨진 이미지 대신 안내를 보여줘요 (백엔드 공지 11/12)
function NoteImage({ src }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-subtle p-3 text-center text-xs leading-relaxed text-ink-3">
        이 사진은 이 브라우저에서
        <br />
        볼 수 없어요
      </div>
    );
  }
  return <img src={src} alt="공부한 노트" onError={() => setBroken(true)} className="w-full rounded-lg object-cover" />;
}
