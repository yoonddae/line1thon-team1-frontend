// 공부 사이클(B) 화면에서 쓰는 피그마 「디자인」 아이콘

// Feedback/Spinner 44px (회색 원 + 초록 호)
export function SpinnerIcon({ className = 'size-11 animate-spin' }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden>
      <circle cx="22" cy="22" r="18.07" stroke="#D6D3CE" strokeWidth="3.93" />
      <path d="M22 3.93A18.07 18.07 0 0 1 40.07 22" stroke="#11CC7F" strokeWidth="3.93" strokeLinecap="round" />
    </svg>
  );
}

// 로딩 실패 화면의 빨간 경고 삼각형 60px
export function ErrorTriangleIcon({ className = 'size-15' }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" className={className} aria-hidden>
      <path d="M27.5 25h5v12.5h-5V25Zm0 15h5v5h-5v-5Z" fill="#FF6D6D" />
      <path
        d="M34.42 10.5a5.05 5.05 0 0 0-8.84 0L7.24 45.16a4.98 4.98 0 0 0 4.41 7.34h36.7a4.98 4.98 0 0 0 4.42-7.34L34.42 10.5ZM11.65 47.5 30 12.84 48.36 47.5H11.65Z"
        fill="#FF6D6D"
      />
    </svg>
  );
}

// Card/Notice 반짝이 15px
export function SparkleIcon({ className = 'size-[15px] shrink-0' }) {
  return (
    <svg viewBox="0 0 15 15" fill="none" className={className} aria-hidden>
      <path
        d="M7.07 0s.22 3.76 1.77 5.3c1.54 1.55 5.3 1.77 5.3 1.77s-3.76.22-5.3 1.77c-1.55 1.54-1.77 5.3-1.77 5.3s-.22-3.76-1.77-5.3C3.76 7.29 0 7.07 0 7.07s3.76-.22 5.3-1.77C6.85 3.76 7.07 0 7.07 0Z"
        fill="#11CC7F"
      />
    </svg>
  );
}

// Icon/Check 22px (초록 원 + 흰 체크) · 정답
export function CheckCircleIcon({ className = 'size-[22px] shrink-0' }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <rect width="22" height="22" rx="11" fill="#11CC7F" />
      <path d="M5 11.29 8.86 15.14 17 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Icon/Close 22px (빨간 원 + 흰 X) · 오답, 사진 빼기
export function CloseCircleIcon({ className = 'size-[22px] shrink-0' }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <rect width="22" height="22" rx="11" fill="#FF6D6D" />
      <path d="M6 6l10 10M16 6 6 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Icon/Add 22px · 사진 추가
export function PlusIcon({ className = 'size-[22px]' }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <path d="M11 1v20M1 11h20" stroke="#5C5B58" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Icon/Chevron/Small 24px (아래 방향) · 서술형 피드백 펼치기
export function ChevronDownIcon({ className = 'size-6 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M18 9l-6 6-6-6" stroke="#5C5B58" strokeWidth="1.5" />
    </svg>
  );
}
