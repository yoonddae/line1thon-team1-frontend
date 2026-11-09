import { useEffect, useState } from 'react';
import { ChevronRightIcon } from './Icons';
import Button from './Button';
import { MESSAGES } from '@/constants/messages';

const SKIP_SECONDS = 5;

// 8.8 전면 광고 자리 (해커톤: 실제 광고 없이 자리만 시연). 5초 뒤 건너뛰기 가능
export default function AdScreen({ onClose }) {
  const [left, setLeft] = useState(SKIP_SECONDS);

  useEffect(() => {
    if (left <= 0) return undefined;
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#242321]">
      <div className="flex w-full max-w-[430px] flex-col px-4 pt-6 pb-10">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-ad px-2 py-1 text-xs font-bold text-ink">광고</span>
          <button
            type="button"
            disabled={left > 0}
            onClick={onClose}
            className="flex h-11 items-center gap-1 rounded-full bg-white/15 px-4 text-sm text-white/80 disabled:cursor-not-allowed"
          >
            {left > 0 ? `건너뛰기 ${left}` : '건너뛰기'}
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-white/30">광고 영역</div>
        <Button onClick={() => alert(MESSAGES.AD_FREE_SOON)}>광고 없이 키우기 (유료)</Button>
      </div>
    </div>
  );
}
