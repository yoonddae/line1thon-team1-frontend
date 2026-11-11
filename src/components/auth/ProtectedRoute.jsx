import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '@/utils/auth';
import { ROUTES } from '@/constants/routes';

// 로그인하지 않은 사용자는 로그인 화면으로 보냅니다.
export default function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}
