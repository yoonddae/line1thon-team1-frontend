// 서버 시간은 한국 시간(ISO 8601, +09:00)으로 와요.

// "10월 29일"
export const formatMonthDay = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

// "10/29"
export const formatShortDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
};

// "오늘", "어제", "3일 전"
export const formatRelativeDay = (iso) => {
  if (!iso) return '아직 공부 전';
  const start = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((start(new Date()) - start(new Date(iso))) / 86400000);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  return `${days}일 전`;
};
