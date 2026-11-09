import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import TextField from '@/components/common/TextField';
import Button from '@/components/common/Button';
import InfoBox from '@/components/common/InfoBox';
import Loading from '@/components/common/Loading';
import { createTree, getTree, updateTree } from '@/apis/tree';
import { ROUTES } from '@/constants/routes';
import { BACKGROUNDS, DEFAULT_BACKGROUND, STUDY_LEVELS } from '@/constants/study';
import { getErrorMessage } from '@/constants/messages';
import { validateSubjectName } from '@/utils/validation';

// 나무 만들기 (T2) / 나무 수정 (T4). URL 에 treeId 가 있으면 수정 화면이에요.
export default function TreeFormPage() {
  const { treeId } = useParams();
  const isEdit = Boolean(treeId);
  const navigate = useNavigate();
  const { state } = useLocation();

  const [subjectName, setSubjectName] = useState('');
  const [studyLevel, setStudyLevel] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getTree(treeId)
      .then((tree) => {
        setSubjectName(tree.subjectName);
        setStudyLevel(tree.studyLevel);
        setBackgroundColor(tree.backgroundColor ?? DEFAULT_BACKGROUND);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isEdit, treeId]);

  const canSubmit = subjectName.trim() && studyLevel && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validateSubjectName(subjectName);
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const values = { subjectName: subjectName.trim(), studyLevel, backgroundColor };
      if (isEdit) {
        await updateTree(treeId, values);
        navigate(ROUTES.TREE(treeId), { replace: true });
      } else {
        const created = await createTree(values);
        navigate(ROUTES.TREE(created.treeId), { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col pb-8">
      <PageHeader title={isEdit ? '나무 수정' : '나무 만들기'} showBack={!state?.first} />

      <div className="mt-6 flex flex-col gap-8 px-4">
        {state?.first && <p className="text-base text-ink-2">첫 나무를 만들어 볼까요? 🌱</p>}

        <TextField
          label="과목 이름"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          placeholder="예: 수학"
          maxLength={20}
          error={error}
        />

        <fieldset>
          <legend className="mb-3 text-base font-semibold text-ink-2">공부 수준</legend>
          <div className="grid grid-cols-2 gap-2">
            {STUDY_LEVELS.map((level) => {
              const selected = studyLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setStudyLevel(level.value)}
                  className={`h-12 rounded-xl bg-surface text-sm ${
                    selected ? 'border-[1.5px] border-primary font-semibold text-ink' : 'text-ink-4'
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-base font-semibold text-ink-2">배경 색상</legend>
          <div className="flex gap-3">
            {BACKGROUNDS.map((bg) => {
              const selected = backgroundColor === bg.value;
              return (
                <button
                  key={bg.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setBackgroundColor(bg.value)}
                  className="flex flex-col items-center gap-1 text-xs text-ink-3"
                >
                  <span
                    className={`size-11 rounded-full border-2 ${selected ? 'border-primary' : 'border-white'}`}
                    style={{ background: `linear-gradient(180deg, ${bg.from}, #fff)` }}
                  />
                  {bg.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <InfoBox>
          {isEdit
            ? '과목 이름 수정은 이름 고치기용이에요. 다른 과목은 새 나무를 만들어 주세요. 바뀐 값은 새로 입력하는 공부부터 적용돼요.'
            : '한 나무에는 하나의 과목만 지정해 주세요. 여러 과목이 섞이면 출제와 관리가 어려워요.'}
        </InfoBox>
      </div>

      <div className="mt-auto px-4 pt-8">
        <Button type="submit" disabled={!canSubmit}>
          {isEdit ? '저장하기' : '나무 심기'}
        </Button>
      </div>
    </form>
  );
}
