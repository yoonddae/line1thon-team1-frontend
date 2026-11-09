import { Outlet } from 'react-router-dom';

// 모든 화면의 바깥 틀. 시안(390px) 기준 모바일 폭으로 가운데 정렬합니다.
export default function Layout() {
  return (
    <div className="flex min-h-full justify-center bg-neutral-300">
      <div className="relative flex min-h-full w-full max-w-[430px] flex-col bg-bg">
        <Outlet />
      </div>
    </div>
  );
}
