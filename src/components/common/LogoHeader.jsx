import Logo from './Logo';

// 탭 화면(숲·복습·내 정보) 상단의 GROOIT 로고
export default function LogoHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center px-4">
      <Logo />
    </header>
  );
}
