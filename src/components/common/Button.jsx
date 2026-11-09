const VARIANTS = {
  primary: 'bg-primary text-white active:bg-primary-dark disabled:bg-primary/40',
  secondary: 'bg-line text-ink-3 active:brightness-95 disabled:opacity-60', // 취소, 목록으로
  danger: 'bg-danger text-white active:brightness-95 disabled:opacity-60',
  white: 'bg-surface text-ink-2 active:bg-subtle disabled:text-ink-4',
};

// 시안 기준 높이 48px, 모서리 12px
export default function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`h-12 w-full rounded-xl text-base font-semibold transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
