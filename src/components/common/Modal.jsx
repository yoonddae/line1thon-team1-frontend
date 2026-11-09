// 가운데 흰 카드 팝업. 바깥을 누르면 onClose (없으면 닫히지 않음)
export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-[398px] flex-col rounded-2xl bg-surface p-4 shadow-[0_6px_20px_rgba(42,41,38,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalTitle({ children }) {
  return <h2 className="text-lg font-semibold text-ink">{children}</h2>;
}

export function ModalText({ children }) {
  return <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-3">{children}</p>;
}

export function ModalActions({ children }) {
  return <div className="mt-6 flex flex-col gap-2">{children}</div>;
}
