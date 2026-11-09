import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './Icons';

// 뒤로가기 + 가운데 제목(+작은 부제목) + 오른쪽 영역
export default function PageHeader({ title, subtitle, onBack, showBack = true, right = null }) {
  const navigate = useNavigate();

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-center px-4">
      {showBack && (
        <button
          type="button"
          onClick={onBack ?? (() => navigate(-1))}
          aria-label="뒤로 가기"
          className="absolute left-3 p-1 text-ink-2"
        >
          <ChevronLeftIcon />
        </button>
      )}
      <div className="flex max-w-[70%] flex-col items-center">
        <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-ink-3">{subtitle}</p>}
      </div>
      {right && <div className="absolute right-3">{right}</div>}
    </header>
  );
}
