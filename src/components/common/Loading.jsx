// 조회 중 표시. fullScreen 이면 화면을 덮어요 (AI 출제·채점 대기용)
export default function Loading({ message, fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-sm text-ink-3">
      <span className="size-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      {message && <p className="text-center whitespace-pre-line">{message}</p>}
    </div>
  );

  if (!fullScreen) return <div className="flex flex-1 items-center justify-center py-20">{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90">{content}</div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-sm text-ink-3">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-primary underline">
          다시 시도
        </button>
      )}
    </div>
  );
}
