import { useId } from 'react';
import { GRADE, GRADE_COLOR } from '@/constants/study';

// 잎 아이콘 하나 (결과 화면, 복습 결과 팝업 등). 색은 피그마 잎 에셋 기준
export default function Leaf({ grade = GRADE.GREEN, className = 'size-12' }) {
  const id = useId();
  const color = GRADE_COLOR[grade] ?? GRADE_COLOR[GRADE.GREEN];

  return (
    <svg viewBox="-23 -29 46 58" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="-15" y1="-26" x2="15" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor={color.from} />
          <stop offset="1" stopColor={color.to} />
        </linearGradient>
      </defs>
      <g transform={grade === GRADE.BUD ? 'scale(0.5)' : undefined}>
        <ellipse rx="18" ry="30" transform="rotate(-30)" fill={color.base} />
        <path
          d="M-15 -25.98C-6.39 -30.95 7.3 -23.35 15.59 -9C23.87 5.35 23.61 21.01 15 25.98L-15 -25.98Z"
          fill={`url(#${id})`}
        />
      </g>
    </svg>
  );
}
