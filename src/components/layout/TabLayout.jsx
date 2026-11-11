import { NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { BookIcon, PersonIcon, TreeIcon } from '@/components/common/Icons';

const TABS = [
  { to: ROUTES.FOREST, label: '숲', Icon: TreeIcon },
  { to: ROUTES.REVIEW, label: '복습', Icon: BookIcon },
  { to: ROUTES.MY, label: '정보', Icon: PersonIcon },
];

// 하단 탭바가 있는 화면(숲·복습·정보)과 나무 화면용 레이아웃
export default function TabLayout() {
  return (
    <>
      <div className="flex flex-1 flex-col pb-[72px]">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 z-30 flex h-[72px] w-full max-w-[430px] -translate-x-1/2 border-t-[1.5px] border-subtle bg-surface pb-2">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] ${
                isActive ? 'text-primary' : 'text-ink-4'
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
