import logo from '@/assets/images/logo.svg';

export default function Logo({ className = 'h-[19px]' }) {
  return <img src={logo} alt="GROOIT" className={className} />;
}
