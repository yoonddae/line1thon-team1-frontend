import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@/components/common/Icons';

// 피그마 Header(Detail / Detail-Overline): 뒤로가기 + 가운데 제목, 제목 위에 작은 캡션(예: "수학나무")
export default function StudyHeader({ title, overline, onBack, right = null }) {
  const navigate = useNavigate();
  return (
    <header className="mt-4 flex h-11 shrink-0 items-center justify-between px-4">
      <button type="button" onClick={onBack ?? (() => navigate(-1))} aria-label="뒤로 가기" className="size-6 text-ink-2">
        <ChevronLeftIcon />
      </button>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 text-center">
        {overline && <p className="max-w-full truncate text-xs leading-[1.1] text-ink-3">{overline}</p>}
        <h1 className="max-w-full truncate text-lg leading-[1.4] font-medium text-ink">{title}</h1>
      </div>
      <div className="flex size-6 items-center justify-center text-ink-2">{right}</div>
    </header>
  );
}
