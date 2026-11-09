import { getBackground } from '@/constants/study';

// 나무 화면·숲 카드의 배경 그라데이션 (backgroundColor: BLUE·PINK·YELLOW·GREEN)
export const skyGradient = (backgroundColor) =>
  `linear-gradient(180deg, ${getBackground(backgroundColor).from} 0%, #FFFFFF 100%)`;

export default function SkyBackground({ backgroundColor, className = '', children }) {
  return (
    <div className={className} style={{ background: skyGradient(backgroundColor) }}>
      {children}
    </div>
  );
}
