import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import useApi from '@/hooks/useApi';
import { getTree } from '@/apis/tree';
import { createStudy } from '@/apis/study';
import { isInProgressError } from '@/apis/client';
import { ROUTES } from '@/constants/routes';
import { INPUT_TYPE } from '@/constants/study';
import { ERROR_MESSAGES, getErrorMessage } from '@/constants/messages';

// 공부 입력 (S1): 노트 사진(+메모) 또는 텍스트 → AI 7문제 출제
export default function MaterialInputPage() {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { data: tree } = useApi(() => getTree(treeId), [treeId]);

  const [inputType, setInputType] = useState(INPUT_TYPE.IMAGE);
  const [photos, setPhotos] = useState([]);
  const [memo, setMemo] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const previews = usePreviews(photos);
  const hasMaterial = inputType === INPUT_TYPE.IMAGE ? photos.length > 0 : content.trim().length > 0;

  const handleGenerate = async () => {
    if (generating) return;
    if (!hasMaterial) {
      setError(ERROR_MESSAGES.STUDY_INPUT_EMPTY);
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const quizSet = await createStudy(treeId, {
        inputType,
        content: inputType === INPUT_TYPE.TEXT ? content.trim() : undefined,
        memo: inputType === INPUT_TYPE.IMAGE ? memo.trim() : undefined,
        images: inputType === INPUT_TYPE.IMAGE ? photos : [],
      });
      navigate(ROUTES.QUIZ(quizSet.quizSetId), {
        replace: true,
        state: { quizSet, context: { treeId: Number(treeId), subjectName: tree?.subjectName } },
      });
    } catch (err) {
      if (!isInProgressError(err)) setError(getErrorMessage(err));
      setGenerating(false);
    }
  };

  return (
    <section className="flex flex-1 flex-col pb-8">
      <PageHeader title="오늘 공부한 내용" subtitle={tree ? `${tree.subjectName} 나무` : undefined} />

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <div className="flex rounded-xl bg-info p-1">
          {[
            { value: INPUT_TYPE.IMAGE, label: '노트 사진' },
            { value: INPUT_TYPE.TEXT, label: '텍스트' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setInputType(tab.value);
                setError('');
              }}
              className={`h-10 flex-1 rounded-lg text-sm font-medium ${
                inputType === tab.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {inputType === INPUT_TYPE.IMAGE ? (
          <>
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-line bg-surface p-3 text-ink-3">
              {previews.length ? (
                <div className="grid w-full grid-cols-3 gap-2">
                  {previews.map((src) => (
                    <img key={src} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  ))}
                </div>
              ) : (
                <>
                  <span className="text-3xl leading-none font-extralight">+</span>
                  <span className="text-sm">노트 사진을 올려주세요</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  setPhotos(Array.from(e.target.files ?? []));
                  setError('');
                }}
              />
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택) 예: 이차함수 꼭짓점, 판별식"
              className="h-24 resize-none rounded-xl border border-line bg-surface p-4 text-sm outline-none placeholder:text-ink-4 focus:border-primary"
            />
          </>
        ) : (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
            }}
            placeholder="오늘 공부한 내용을 적어주세요"
            className="min-h-64 flex-1 resize-none rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed outline-none placeholder:text-ink-4 focus:border-primary"
          />
        )}

        {error && <p className="px-1 text-sm text-danger">{error}</p>}

        <div className="mt-auto pt-4">
          <Button onClick={handleGenerate} disabled={generating}>
            AI 문제 만들기
          </Button>
        </div>
      </div>

      {generating && <Loading fullScreen message={'AI가 7문제를 만들고 있어요\n최대 1분 정도 걸릴 수 있어요'} />}
    </section>
  );
}

// 선택한 사진의 미리보기 URL (화면을 떠나면 해제)
function usePreviews(files) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  return urls;
}
