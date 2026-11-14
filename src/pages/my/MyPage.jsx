import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoHeader from '@/components/common/LogoHeader';
import TextField from '@/components/common/TextField';
import Button from '@/components/common/Button';
import Modal, { ModalActions, ModalText, ModalTitle } from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import useApi from '@/hooks/useApi';
import { getMe, logout, updateNickname, withdraw } from '@/apis/user';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/constants/messages';
import { clearToken } from '@/utils/auth';
import { validateNickname } from '@/utils/validation';

// 내 정보 (U3 조회, U4 닉네임 수정, U5 로그아웃, U6 탈퇴)
export default function MyPage() {
  const navigate = useNavigate();
  const { data: me, setData, loading } = useApi(() => getMe(), []);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (me) setNickname(me.nickname);
  }, [me]);

  const changed = me && nickname.trim() !== me.nickname;

  const handleSave = async () => {
    const message = validateNickname(nickname);
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await updateNickname(nickname.trim());
      setData((prev) => ({ ...prev, nickname: result.nickname }));
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    clearToken();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    leave();
  };

  const handleWithdraw = async () => {
    try {
      await withdraw();
      leave();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="flex flex-1 flex-col">
      <LogoHeader />
      <div className="flex flex-col gap-4 px-4 pt-4">
        <div>
          <h2 className="text-base font-semibold text-ink-2">닉네임 수정</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            다른 사람이 쓰는 닉네임은 쓸 수 없어요.
            <br />
            바꾸면 새 닉네임으로 로그인해요.
          </p>
        </div>
        <TextField
          aria-label="닉네임"
          value={nickname}
          maxLength={10}
          onChange={(e) => {
            setNickname(e.target.value);
            setSaved(false);
          }}
          error={error}
        />
        {/* 눌러도 될 때만 진한 초록, 못 누를 때(그대로이거나 저장 중·저장 완료)는 회색 */}
        <Button variant={changed && !saving ? 'primary' : 'secondary'} onClick={handleSave} disabled={!changed || saving}>
          {saved ? '저장했어요' : '변경사항 저장'}
        </Button>

        <ul className="mt-6 rounded-xl bg-surface px-3 text-sm">
          <li className="border-b border-subtle">
            <button type="button" onClick={handleLogout} className="h-12 w-full text-left text-ink-2">
              로그아웃
            </button>
          </li>
          <li>
            <button type="button" onClick={() => setWithdrawOpen(true)} className="h-12 w-full text-left text-danger">
              계정 탈퇴
            </button>
          </li>
        </ul>
      </div>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
        <ModalTitle>정말 탈퇴할까요?</ModalTitle>
        <ModalText>{'나무, 공부 기록, 문제, 잎이 모두 지워지고\n되돌릴 수 없어요.'}</ModalText>
        <ModalActions>
          <Button variant="danger" onClick={handleWithdraw}>
            탈퇴하기
          </Button>
          <Button variant="secondary" onClick={() => setWithdrawOpen(false)}>
            취소
          </Button>
        </ModalActions>
      </Modal>
    </section>
  );
}
