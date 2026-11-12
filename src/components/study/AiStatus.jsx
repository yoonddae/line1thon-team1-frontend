import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import { ErrorTriangleIcon, SpinnerIcon } from './StudyIcons';
import { errorCodeLabel } from '@/constants/aiError';
import { MESSAGE_INTERVAL_MS } from '@/constants/loadingMessages';

// 문구를 3~4초마다 다음 것으로 바꾸고, 마지막 문구에서 멈춰요. (같은 문구가 오래 있으면 멈춘 것처럼 보여서)
function useRotatingMessage(messages) {
  const [index, setIndex] = useState(0);
  const key = messages.join('|'); // 문구 내용이 바뀔 때만 처음부터
  const count = messages.length;
  useEffect(() => {
    setIndex(0);
    if (count < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => Math.min(i + 1, count - 1));
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [key, count]);
  return messages[Math.min(index, count - 1)];
}

const toList = (messages, message) => (messages?.length ? messages : [message]);

// 피그마 「로딩화면」 [긴 로딩] 전체 화면: 공부 입력(10~14초) · 다시 도전(약 12초) · 복습 시작(약 5초), 최대 60초
// messages 를 주면 3~4초마다 바뀌어요. (예전처럼 message 하나만 줘도 돼요)
export function AiLoadingScreen({ messages, message = 'AI가 공부한 내용을 읽고 있어요' }) {
  const text = useRotatingMessage(toList(messages, message));
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex justify-center bg-neutral-300">
      <div className="flex w-full max-w-[430px] flex-col items-center justify-center gap-3 bg-subtle px-2.5">
        <SpinnerIcon />
        <p key={text} className="loading-text text-center text-lg leading-[1.4] font-medium text-ink-2">
          {text}
        </p>
      </div>
    </div>
  );
}

// [짧은 로딩] 지금 화면 위에 띄우는 정도: 채점하기(2~3초). 뒤 화면은 눌리지 않아요.
export function AiShortLoading({ messages, message = '채점하고 있어요' }) {
  const text = useRotatingMessage(toList(messages, message));
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="flex items-center gap-3 rounded-2xl bg-surface px-6 py-5 shadow-[0_6px_20px_rgba(42,41,38,0.1)]">
        <SpinnerIcon className="size-7 animate-spin" />
        <p key={text} className="loading-text text-base font-medium text-ink-2">
          {text}
        </p>
      </div>
    </div>
  );
}

// 피그마 「로딩 실패 화면」: ① 다시 시도 (AI_SERVER_ERROR · AI_TIMEOUT · 인터넷 끊김 · 60초 초과)
// 입력·사진·답은 부르는 화면이 들고 있어서, onRetry 는 같은 내용으로 다시 보내요.
export function AiRetryScreen({ error, onRetry, onClose }) {
  return (
    <div role="alert" className="fixed inset-0 z-50 flex justify-center bg-neutral-300">
      <div className="flex w-full max-w-[430px] flex-col bg-subtle">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-2.5 text-center">
          <ErrorTriangleIcon />
          <div>
            <p className="text-lg leading-[1.4] font-medium text-ink-2">잠시 후 다시 시도해 주세요</p>
            {error && <p className="text-sm leading-[1.4] text-ink-3">{errorCodeLabel(error)}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]">
          <Button onClick={onRetry}>다시 시도하기</Button>
          <Button variant="secondary" className="font-normal" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

// 피그마 「공부 내용 입력_에러 팝업」: ② 입력 고치기 · ③ 안내 (확인 버튼 하나)
export function AiAlertModal({ message, error, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div role="alertdialog" aria-modal="true" aria-label={message} className="flex w-full max-w-[358px] flex-col gap-9 rounded-2xl bg-surface px-4 py-6 drop-shadow-[0_6px_10px_rgba(42,41,38,0.1)]">
        <div className="flex flex-col gap-2">
          <p className="text-lg leading-[1.4] font-semibold text-ink">{message}</p>
          {error && <p className="text-sm leading-[1.4] text-ink-3">{errorCodeLabel(error)}</p>}
        </div>
        <Button onClick={onClose} autoFocus>
          확인
        </Button>
      </div>
    </div>
  );
}
