import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import StudyHeader from '@/components/study/StudyHeader';
import { AiAlertModal, AiLoadingScreen, AiRetryScreen } from '@/components/study/AiStatus';
import { CloseCircleIcon, PlusIcon, SparkleIcon } from '@/components/study/StudyIcons';
import useApi from '@/hooks/useApi';
import { getTree } from '@/apis/tree';
import { createStudy } from '@/apis/study';
import { ROUTES } from '@/constants/routes';
import { INPUT_TYPE, MAX_LEAVES } from '@/constants/study';
import { ERROR_MESSAGES, getErrorMessage } from '@/constants/messages';
import { AI_ERROR_KIND, aiErrorKind } from '@/constants/aiError';
import { LOADING_MESSAGES } from '@/constants/loadingMessages';

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// 아이폰 사진(heic)은 accept 에 heic 를 안 넣으면 브라우저가 JPEG 로 바꿔서 올려줘요 (팀장님 공지)
const ACCEPT = 'image/jpeg,image/png,image/webp';
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MIN_CONTENT = 20;
const MAX_CONTENT = 5000;
const MAX_MEMO = 200;

/**
 * 공부 입력 (S1, 피그마 「디자인」 숲_공부 내용 입력 / _입력 완료) → 로딩화면 → 문제 풀기
 * 입력 칸은 하나: 사진이 없으면 칸 내용이 content(TEXT, 20~5,000자), 사진이 있으면 memo(IMAGE, 200자까지)
 * 실패하면 ① 다시 시도 → 로딩 실패 화면 / ② 입력 고치기 · ③ 안내 → 이 화면 위 팝업. 입력은 그대로 남아요.
 */
export default function MaterialInputPage() {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { data: tree, error: treeError } = useApi(() => getTree(treeId), [treeId]);

  const [photos, setPhotos] = useState([]);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('input'); // input | loading | retry
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // { message, error }
  const [viewing, setViewing] = useState(null); // 크게 보는 사진 번호
  const fileRef = useRef(null);
  const sending = useRef(false);
  const previews = usePreviews(photos);

  useEffect(() => {
    if (treeError?.code === 'TREE_NOT_FOUND') navigate(ROUTES.FOREST, { replace: true });
  }, [treeError, navigate]);

  useEffect(() => {
    if (viewing === null) return;
    const onKey = (e) => e.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing]);

  const addPhotos = (fileList) => {
    const picked = Array.from(fileList ?? []);
    const bad = picked.find((f) => (f.type && !OK_TYPES.includes(f.type)) || f.size > MAX_IMAGE_BYTES);
    if (bad) {
      setAlert({ message: ERROR_MESSAGES.IMAGE_INVALID });
      return;
    }
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };

  const hasPhoto = photos.length > 0;
  const length = text.trim().length;
  const memoTooLong = hasPhoto && length > MAX_MEMO;
  const canSubmit = (hasPhoto || length > 0) && !memoTooLong;

  const handleSubmit = async () => {
    if (!canSubmit || sending.current) return;
    if ((tree?.leafCount ?? 0) >= MAX_LEAVES) {
      setAlert({ message: ERROR_MESSAGES.TREE_FULL });
      return;
    }
    if (!hasPhoto && length < MIN_CONTENT) {
      setAlert({ message: ERROR_MESSAGES.CONTENT_TOO_SHORT });
      return;
    }
    sending.current = true;
    setPhase('loading');
    try {
      const quizSet = await createStudy(treeId, {
        inputType: hasPhoto ? INPUT_TYPE.IMAGE : INPUT_TYPE.TEXT,
        content: hasPhoto ? undefined : text.trim(),
        memo: hasPhoto ? text.trim() || undefined : undefined,
        images: photos,
      });
      navigate(ROUTES.QUIZ(quizSet.quizSetId), {
        replace: true,
        state: { quizSet, context: { treeId: Number(treeId), subjectName: tree?.subjectName } },
      });
    } catch (err) {
      const kind = aiErrorKind(err);
      if (err.code === 'TREE_NOT_FOUND') return navigate(ROUTES.FOREST, { replace: true });
      if (kind === AI_ERROR_KIND.IGNORE) return setPhase('input');
      setError(err);
      if (kind === AI_ERROR_KIND.RETRY) return setPhase('retry');
      setPhase('input');
      setAlert({ message: getErrorMessage(err), error: err });
    } finally {
      sending.current = false;
    }
  };

  if (phase === 'loading') {
    return <AiLoadingScreen messages={hasPhoto ? LOADING_MESSAGES.STUDY_IMAGE : LOADING_MESSAGES.STUDY_TEXT} />;
  }
  if (phase === 'retry') return <AiRetryScreen error={error} onRetry={handleSubmit} onClose={() => setPhase('input')} />;

  return (
    <section className="flex flex-1 flex-col bg-subtle">
      <StudyHeader overline={tree ? `${tree.subjectName}나무` : ''} title="오늘 공부한 내용" />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-ink-2">노트 사진</p>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {previews.map((src, i) => (
              <div key={src} className="relative h-[210px] w-[169px] shrink-0 overflow-hidden rounded-2xl border-[1.5px] border-line">
                <button type="button" onClick={() => setViewing(i)} aria-label={`노트 사진 ${i + 1} 크게 보기`} className="absolute inset-0">
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="사진 빼기"
                  className="absolute top-2 right-3"
                >
                  <CloseCircleIcon />
                </button>
              </div>
            ))}
            {photos.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-[210px] w-[169px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-line"
              >
                <PlusIcon />
                <span className="text-sm font-semibold text-ink-3">사진 추가</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        <label className="flex flex-col gap-3">
          <span className="text-base font-semibold text-ink-2">메모</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={hasPhoto ? MAX_MEMO : MAX_CONTENT}
            placeholder="메모를 입력하세요."
            className={`h-[88px] resize-none rounded-xl border bg-surface p-4 text-sm leading-[1.4] text-ink-2 outline-none placeholder:text-ink-4 focus:border-primary ${
              text ? 'border-info' : 'border-line'
            }`}
          />
          {/* 사진이 있으면 메모는 200자까지 (서버가 200자를 넘으면 INVALID_REQUEST) */}
          {hasPhoto && (
            <span className={`-mt-1 text-right text-xs ${memoTooLong ? 'text-danger' : 'text-ink-4'}`}>
              {memoTooLong && '사진이 있을 땐 메모를 200자까지 쓸 수 있어요 · '}
              {length}/{MAX_MEMO}
            </span>
          )}
        </label>

        <div className="flex items-center gap-1 rounded-xl bg-info p-4 text-sm leading-[1.4] text-ink-2">
          <SparkleIcon />
          <span>AI가 노트를 읽고 쉬움부터 어려움까지 7문제를 만들어요.</span>
        </div>
      </div>

      <div className="sticky bottom-0 bg-subtle px-4 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          퀴즈 풀기
        </Button>
      </div>

      <AiAlertModal message={alert?.message} error={alert?.error} onClose={() => setAlert(null)} />

      {viewing !== null && previews[viewing] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="노트 사진 크게 보기"
          onClick={() => setViewing(null)}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-black/90 px-4 pt-[calc(56px+env(safe-area-inset-top))] pb-[calc(32px+env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setViewing(null)}
            className="absolute top-[calc(12px+env(safe-area-inset-top))] right-3 size-10 rounded-full bg-white/15 text-lg text-white"
          >
            ✕
          </button>
          <img
            src={previews[viewing]}
            alt={`노트 사진 ${viewing + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg bg-white object-contain"
          />
          {photos.length > 1 && (
            <p className="text-[13px] text-white">
              {viewing + 1} / {photos.length}
            </p>
          )}
        </div>
      )}
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
