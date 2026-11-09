// 흰 카드에 제목 + 내용 (총평, 한 번 더 볼 부분 등)
export default function FeedbackBox({ title, children }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-base font-semibold text-ink">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function BulletList({ items }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item}>· {item}</li>
      ))}
    </ul>
  );
}
