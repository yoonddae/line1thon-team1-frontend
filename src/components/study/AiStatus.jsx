import Button from '@/components/common/Button';
import { ErrorTriangleIcon, SpinnerIcon } from './StudyIcons';
import { errorCodeLabel } from '@/constants/aiError';

// 피그마 「로딩화면」: AI 를 기다리는 동안 (공부 입력 10~14초 · 채점 2~3초 · 재도전 약 12초, 최대 60초)
export function AiLoadingScreen({ message = 'AI가 공부한 내용을 읽고 있어요' }) {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex justify-center bg-neutral-300">
      <div className="flex w-full max-w-[430px] flex-col items-center justify-center gap-3 bg-subtle px-2.5">
        <SpinnerIcon />
        <p className="text-center text-lg leading-[1.4] font-medium text-ink-2">{message}</p>
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
