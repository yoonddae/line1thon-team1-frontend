// 나무 모양 아이콘 (시안 Select/TreeType, #21). 24×28 기준
const CROWN = {
  BASIC: <circle cx="12" cy="9" r="9" fill="#11CC7F" />, // 기본 나무
  GINKGO: <path d="M12 0L21 13.5C15 17.5 9 17.5 3 13.5L12 0Z" fill="#D8C27A" />, // 은행나무
  MAPLE: <circle cx="12" cy="9" r="9" fill="#D9987F" />, // 단풍나무
};

export default function TreeShapeIcon({ shape = 'BASIC', className = 'h-7 w-6' }) {
  return (
    <svg viewBox="0 0 24 28" className={className} aria-hidden>
      {CROWN[shape]}
      <path d="M10.5 27H13.5L12.75 13.5H11.25L10.5 27Z" fill="#C55A34" />
    </svg>
  );
}
