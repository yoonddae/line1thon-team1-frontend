import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import TextField from '@/components/common/TextField';
import Button from '@/components/common/Button';
import InfoBox from '@/components/common/InfoBox';
import Loading from '@/components/common/Loading';
import TreeShapeIcon from '@/components/tree/TreeShapeIcon';
import { createTree, getTree, getTrees, updateTree } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { BACKGROUNDS, DEFAULT_BACKGROUND, STUDY_LEVELS, TREE_SHAPES } from '@/constants/study';
import { MESSAGES, getErrorMessage } from '@/constants/messages';
import { validateSubjectName } from '@/utils/validation';

/**
 * 새 나무 심기 (T2, 시안 #21) / 나무 수정 (T4, 시안 #16). URL 에 treeId 가 있으면 수정 화면이에요.
 * - 심기: 과목 이름 · 공부 수준 · 나무 모양 · 배경 색상 + 무료 나무 사용 현황(T1)
 * - 수정: 과목 이름 · 공부 수준 · 배경 색상 (나무 모양은 바꿀 수 없어요)
 */
export default function TreeFormPage() {
  const { treeId } = useParams();
  const isEdit = Boolean(treeId);
  const navigate = useNavigate();

  const [subjectName, setSubjectName] = useState('');
  const [studyLevel, setStudyLevel] = useState('');
  const [treeShape, setTreeShape] = useState('BASIC');
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [forest, setForest] = useState(null); // T1: 무료 나무 사용 현황
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const request = isEdit
      ? getTree(treeId).then((tree) => {
          setSubjectName(tree.subjectName);
          setStudyLevel(tree.studyLevel);
          if (tree.backgroundColor) setBackgroundColor(tree.backgroundColor);
        })
      : getTrees().then(setForest);
    request.catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [isEdit, treeId]);

  // 무료 나무를 다 썼으면 "추가 나무 구매하고 심기" (결제는 추후 개발이라 안내만)
  const isFull = !isEdit && forest && !forest.canAddFreeTree;
  const canSubmit = subjectName.trim() && studyLevel && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFull) {
      alert(MESSAGES.TREE_PURCHASE_SOON);
      return;
    }
    const message = validateSubjectName(subjectName);
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateTree(treeId, { subjectName: subjectName.trim(), studyLevel, backgroundColor });
        navigate(ROUTES.TREE(treeId), { replace: true });
      } else {
        const created = await createTree({ subjectName: subjectName.trim(), studyLevel, treeShape, backgroundColor });
        navigate(ROUTES.TREE(created.treeId), { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col bg-subtle pb-8">
      <PageHeader title={isEdit ? '나무 수정' : '새 나무 심기'} />

      <div className="mt-6 flex flex-col gap-6 px-4">
        <TextField
          label="과목 이름"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          placeholder="과목 이름을 입력하세요."
          maxLength={20}
          error={error}
        />

        <Field label="공부 수준">
          <div className="grid grid-cols-2 gap-2">
            {STUDY_LEVELS.map((level) => {
              const selected = studyLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setStudyLevel(level.value)}
                  className={`h-12 rounded-xl border-[1.5px] bg-surface text-sm ${
                    selected ? 'border-primary font-semibold text-ink-2' : 'border-transparent text-ink-4'
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </Field>

        {!isEdit && (
          <>
            <Field label="나무 모양">
              <div className="grid grid-cols-3 gap-2">
                {TREE_SHAPES.map((shape) => {
                  const selected = treeShape === shape.value;
                  return (
                    <button
                      key={shape.value}
                      type="button"
                      aria-pressed={selected}
                      disabled={!shape.available}
                      onClick={() => setTreeShape(shape.value)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] py-4 text-sm whitespace-nowrap ${
                        selected
                          ? 'border-primary bg-surface font-semibold text-ink-2'
                          : shape.available
                            ? 'border-transparent bg-surface text-ink-2'
                            : 'border-transparent bg-info text-ink-3'
                      }`}
                    >
                      <TreeShapeIcon shape={shape.value} />
                      {shape.available ? shape.label : '추가 예정'}
                    </button>
                  );
                })}
              </div>
            </Field>
          </>
        )}

        <Field label="배경 색상">
          <div className="flex justify-between">
            {BACKGROUNDS.map((bg) => {
              const selected = backgroundColor === bg.value;
              return (
                <button
                  key={bg.value}
                  type="button"
                  aria-label={`${bg.label} 배경`}
                  aria-pressed={selected}
                  onClick={() => setBackgroundColor(bg.value)}
                  className="relative size-16 rounded-xl"
                  style={{ background: bg.from }}
                >
                  {selected && (
                    <span className="absolute top-1 right-1 flex size-[22px] items-center justify-center rounded-full bg-primary">
                      <svg viewBox="0 0 12 10" className="h-2.5 w-3" aria-hidden>
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Field>

        {!isEdit && forest && (
          <div className="rounded-2xl bg-info p-4">
            <p className="text-base font-semibold text-ink-2">
              무료 나무 {forest.treeCount} / {forest.freeTreeLimit} 사용 중
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              {isFull ? (
                '무료 나무를 모두 심었어요.'
              ) : (
                <>무료 나무를 {forest.freeTreeLimit - forest.treeCount}그루 더 심을 수 있어요.</>
              )}
              <br />
              {forest.freeTreeLimit + 1}번째 나무부터는 유료로 심을 수 있어요.
            </p>
          </div>
        )}

        {isEdit && (
          <InfoBox>
            한 나무에는 하나의 과목만 지정해 주세요. 여러 과목이 중복될 경우 출제와 관리가 어려우니 수정 및 등록
            시 주의해 주시기 바랍니다.
          </InfoBox>
        )}
      </div>

      <div className="mt-auto px-4 pt-8">
        <Button type="submit" disabled={isFull ? saving : !canSubmit}>
          {isEdit ? '저장하기' : isFull ? '추가 나무 구매하고 심기' : '나무 심기'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-semibold text-ink-2">{label}</legend>
      {children}
    </fieldset>
  );
}
