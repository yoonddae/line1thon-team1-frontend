import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import TextField from '@/components/common/TextField';
import Button from '@/components/common/Button';
import InfoBox from '@/components/common/InfoBox';
import { ROUTES } from '@/constants/routes';
import { signup } from '@/apis/user';
import { setToken } from '@/utils/auth';
import { sanitizePassword, validateNickname, validatePassword } from '@/utils/validation';
import { getErrorMessage } from '@/constants/messages';

// 시작하기 - 가입 (U1). 닉네임 + 비밀번호 칸만 있어요.
export default function SignupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = { nickname: validateNickname(nickname), password: validatePassword(password) };
    setErrors(next);
    if (next.nickname || next.password || loading) return;

    setLoading(true);
    try {
      const { accessToken } = await signup({ nickname: nickname.trim(), password });
      setToken(accessToken);
      navigate(ROUTES.FOREST, { replace: true }); // A1 → A2 숲
    } catch (err) {
      const message = getErrorMessage(err);
      setErrors(err.code === 'PASSWORD_INVALID' ? { password: message } : { nickname: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col pb-8">
      <PageHeader title="회원가입" />
      <div className="mt-6 flex flex-col gap-8 px-4">
        <TextField
          label="닉네임"
          hint="(2~10자)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          maxLength={10}
          error={errors.nickname}
        />
        <TextField
          label="비밀번호"
          hint="(숫자 4~6자리)"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(sanitizePassword(e.target.value))}
          placeholder="••••"
          error={errors.password}
        />
        <InfoBox>
          비밀번호 찾기 기능이 없어요.
          <br />
          잊어버리지 않게 꼭 기억해 주세요.
        </InfoBox>
      </div>
      <div className="mt-auto px-4 pt-8">
        <Button type="submit" disabled={loading}>
          {loading ? '가입 중...' : '가입 후 시작하기'}
        </Button>
      </div>
    </form>
  );
}
