import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6">
      <Logo />
      <h1 className="text-lg font-semibold text-ink">페이지를 찾을 수 없어요</h1>
      <Link to={ROUTES.FOREST} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white">
        숲으로 가기
      </Link>
    </section>
  );
}
