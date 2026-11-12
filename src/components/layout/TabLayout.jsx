import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { BookIcon, PersonIcon, TreeIcon } from '@/components/common/Icons';

// also: 이 탭으로 같이 켜질 주소 (나무·가지 화면은 숲 탭 안에 있는 화면이라 숲이 초록색)
const TABS = [
  { to: ROUTES.FOREST, label: '숲', Icon: TreeIcon, also: ['/trees/'] },
  { to: ROUTES.REVIEW, label: '복습', Icon: BookIcon },
  { to: ROUTES.MY, label: '정보', Icon: PersonIcon },
];

// 하단 탭바가 있는 화면(숲·복습·정보)과 나무 화면용 레이아웃
export default function TabLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <div className="flex flex-1 flex-col pb-[72px]">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 z-30 flex h-[72px] w-full max-w-[430px] -translate-x-1/2 border-t-[1.5px] border-subtle bg-surface pb-2">
        {TABS.map(({ to, label, Icon, also = [] }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] ${
                isActive || also.some((prefix) => pathname.startsWith(prefix)) ? 'text-primary' : 'text-ink-4'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
