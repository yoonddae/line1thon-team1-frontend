// 회색 안내 박스 (예: "비밀번호 찾기 기능이 없어요")
export default function InfoBox({ children, className = '' }) {
  return (
    <div className={`rounded-xl bg-info px-3 py-4 text-sm leading-relaxed text-ink-2 ${className}`}>
      {children}
    </div>
  );
}
