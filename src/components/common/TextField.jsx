// 라벨 + 흰 입력칸 + 에러 문구. 에러가 있으면 테두리가 빨개져요.
export default function TextField({ label, hint, error, className = '', ...inputProps }) {
  return (
    <label className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <span className="text-base font-semibold text-ink-2">
          {label} {hint && <span className="font-normal text-ink-3">{hint}</span>}
        </span>
      )}
      <input
        className={`h-12 rounded-xl border bg-surface px-4 text-sm text-ink-2 outline-none placeholder:text-ink-4 ${
          error ? 'border-danger' : 'border-line focus:border-primary'
        }`}
        {...inputProps}
      />
      {error && <span className="-mt-1 px-1 text-sm text-danger">{error}</span>}
    </label>
  );
}
