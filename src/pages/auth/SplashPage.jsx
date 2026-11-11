import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';
import { isLoggedIn } from '@/utils/auth';

const SPLASH_MS = 1200;

// 스플래시 (시안 #23): 로고를 잠깐 보여주고 로그인 상태에 따라 숲 또는 로그인으로 이동
export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isLoggedIn() ? ROUTES.FOREST : ROUTES.LOGIN, { replace: true });
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="flex flex-1 items-center justify-center">
      <Logo className="h-[58px]" />
    </section>
  );
}
