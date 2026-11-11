import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import TextField from '@/components/common/TextField';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import { login } from '@/apis/user';
import { isLoggedIn, setToken } from '@/utils/auth';
import { sanitizePassword } from '@/utils/validation';
import { getErrorMessage } from '@/constants/messages';

// 시작하기 - 로그인 (U2, 시안 #2). 닉네임 + 비밀번호 칸만 있어요.
export default function LoginPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn()) return <Navigate to={ROUTES.FOREST} replace />;

  const canSubmit = nickname.trim() && password.length >= 4 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const { accessToken } = await login({ nickname: nickname.trim(), password });
      setToken(accessToken);
      navigate(ROUTES.FOREST, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4 pt-12 pb-8">
      <div className="flex flex-col gap-8">
        <TextField
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          autoComplete="username"
        />
        <TextField
          label="비밀번호"
          hint="(숫자 4~6자리)"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(sanitizePassword(e.target.value))}
          placeholder="••••"
          error={error}
        />
      </div>
      <div className="mt-auto flex flex-col items-center gap-5">
        <Button type="submit" disabled={!canSubmit}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>
        <Link to={ROUTES.SIGNUP} className="text-base text-ink-3">
          회원가입
        </Link>
      </div>
    </form>
  );
}
