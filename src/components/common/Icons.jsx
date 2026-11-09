// 피그마 시안의 아이콘. 색은 currentColor 를 따르므로 text-* 클래스로 바꿔주세요.

export function ChevronLeftIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M15 4L7 12L15 20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChevronRightIcon({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function KebabIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="12" cy="5.5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="18.5" r="1.6" />
    </svg>
  );
}

export function PlayIcon({ className = 'size-3' }) {
  return (
    <svg viewBox="0 0 12 14" fill="currentColor" className={className} aria-hidden>
      <path d="M11.5 6.13a1 1 0 0 1 0 1.74L1.5 13.6A1 1 0 0 1 0 12.73V1.27A1 1 0 0 1 1.5.4l10 5.73Z" />
    </svg>
  );
}

// 하단 탭: 숲
export function TreeIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        transform="translate(-71 -765)"
        d="M83.0002 783.505H87.0468C91.328 783.712 94.2847 779.377 92.4421 775.591C93.7397 772.62 91.6868 769.276 88.3956 768.997C86.135 764.709 79.8655 764.709 77.6049 768.997C74.3137 769.276 72.2608 772.62 73.5584 775.591C71.7158 779.377 74.6725 783.712 78.9537 783.505H83.0002ZM83.0002 783.505V788.781M83.0002 783.505V779.548M83.0002 779.548L78.9537 775.591M83.0002 779.548L87.0468 775.591"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 하단 탭: 복습
export function BookIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <g
        transform="translate(-183 -765)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M187.19 783.33H198.236C200.867 783.33 201.548 783.33 202.369 782.466C203.19 781.603 203.19 780.219 203.19 777.442V772.888C203.19 770.111 203.19 768.717 202.369 767.854C201.548 767 200.233 767 197.593 767L192.788 767C190.157 767 188.832 766.99 188.011 767.854C187.19 768.717 187.19 770.111 187.19 772.878V783.33ZM187.19 783.33C187.19 784.939 187.19 785.744 187.61 786.274L187.871 786.568C188.394 787 189.159 787 190.68 787L198.955 787C200.476 787 201.241 787 201.754 786.558C201.852 786.477 201.943 786.385 202.024 786.284C202.444 785.744 202.444 784.066 202.444 782.466" />
        <path d="M194.19 768V773.355C194.19 774.338 194.19 774.819 194.51 774.965C194.818 775.112 195.19 774.787 195.946 774.149L196.616 773.595C196.956 773.302 197.127 773.156 197.339 773.156C197.541 773.156 197.701 773.313 198.031 773.627L198.403 773.961C199.169 774.672 199.552 775.028 199.871 774.902C200.19 774.756 200.19 774.244 200.19 773.198V768" />
      </g>
    </svg>
  );
}

// 하단 탭: 정보
export function PersonIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="6.5" r="3.7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.6 13.8h8.8a4.3 4.3 0 0 1 4.3 4.3 2.4 2.4 0 0 1-2.4 2.4H5.7a2.4 2.4 0 0 1-2.4-2.4 4.3 4.3 0 0 1 4.3-4.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
